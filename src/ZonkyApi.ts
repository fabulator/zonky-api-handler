/* eslint-disable @typescript-eslint/camelcase */
import { DateTime } from 'luxon';
import { Api, DefaultResponseProcessor, ApiResponseType } from 'rest-api-handler';
import decodeResponse from './decodeResponse';
import ZonkyApiException from './ZonkyApiException';
import * as SCOPES from './api-scopes';
import { TransactionOrientation } from './transaction-orientations';
import { TransactionCategory } from './transaction-categories';

interface Token {
    access_token: string,
    token_type: string,
    refresh_token: string,
    expires_in: number,
    scope: string,
}

interface Transaction {
    id: number,
    amount: number,
    discount: number,
    category: TransactionCategory,
    transactionDate: DateTime,
    customMessage: string | undefined,
    orientation: TransactionOrientation,
    loanId: number,
    loanName: string,
    nickName: string,
}

interface TransactionsResponse {
    transactions: Transaction[],
    paging: {
        page: number,
        total: number,
    },
}

async function getPromiseInterval(fn: (callback: Function) => void, timeout: number): Promise<any> {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            fn((data: any) => {
                clearInterval(interval);
                resolve(data);
            });
        }, timeout);
    });
}

export default class ZonkyApi extends Api<ApiResponseType<any>> {
    protected refreshToken?: string;

    protected accessToken?: string;

    protected tokenExpire?: DateTime;

    public static SCOPES = SCOPES;

    public constructor() {
        super('https://api.zonky.cz', [
            new DefaultResponseProcessor(ZonkyApiException, decodeResponse),
        ], {
            Authorization: 'Basic d2ViOndlYg==',
            'Content-Type': 'application/json',
        });
    }

    public getAccessToken() {
        return this.accessToken;
    }

    public setAccessToken(token?: string): this {
        this.accessToken = token;
        return this;
    }

    public setRefreshToken(token: string): this {
        this.refreshToken = token;
        return this;
    }

    public getRefreshToken() {
        return this.refreshToken;
    }

    public setTokenExpire(expire: DateTime): this {
        this.tokenExpire = expire;
        return this;
    }

    public getTokenExpire() {
        return this.tokenExpire;
    }

    public async login(
        username: string,
        password: string,
        scope: SCOPES.ApiScope[] = [SCOPES.APP_WEB, SCOPES.FILE_DOWNLOAD],
    ): Promise<Token> {
        const { data } = await this.post(
            'oauth/token',
            {
                username,
                password,
                scope: scope.join(' '),
                grant_type: 'password',
            },
            ZonkyApi.FORMATS.URL_ENCODED,
            {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        );

        this.setDefaultHeader('Authorization', `Bearer ${data.access_token}`);
        this.setAccessToken(data.access_token);
        this.setRefreshToken(data.refresh_token);
        this.setTokenExpire(DateTime.local().plus({ seconds: data.expires_in }));

        return data;
    }

    public async getTransactions(from?: DateTime, page = 0, size?: number): Promise<TransactionsResponse> {
        const response = await this.get('users/me/wallet/transactions', {
            ...(from ? { 'transaction.transactionDate': from.toFormat('yyyy-MM-dd') } : {}),
        }, {
            'X-Page': page,
            ...(size ? { 'X-Size': size } : {}),
        });

        const { headers } = response.source;

        return {
            transactions: response.data.map((transaction: any) => {
                return {
                    ...transaction,
                    transactionDate: DateTime.fromISO(transaction.transactionDate),
                };
            }),
            paging: {
                page,
                total: Number(headers.get('x-total')),
            },
        };
    }

    public async downloadTransactions(): Promise<Buffer> {
        await this.post('users/me/wallet/transactions/export');

        return getPromiseInterval(async (resolve) => {
            const { status } = await this.get('users/me/wallet/transactions/export');

            if (status === 204) {
                const headers = this.getDefaultHeaders();
                this.setDefaultHeaders({});
                const { data } = await this.request(
                    `users/me/wallet/transactions/export/data?access_token=${this.getAccessToken()}`,
                    'GET',
                );
                this.setDefaultHeaders(headers);
                resolve(data);
            }
        }, 5000);
    }

    public async processTransactions(
        processor: (workout: Transaction) => Promise<Transaction>,
        from?: DateTime,
        size = 40,
        page = 0,
    ): Promise<any> {
        const { transactions, paging } = await this.getTransactions(from, page, size);

        const processorPromises = transactions.map((transaction: Transaction) => {
            return processor(transaction);
        });

        if (paging.total > (paging.page + 1) * size) {
            processorPromises.push(...await this.processTransactions(processor, from, size, page + 1));
        }

        return Promise.all(processorPromises);
    }
}
