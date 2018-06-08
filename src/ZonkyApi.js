// @flow
import { DateTime } from 'luxon';
import DefaultResponseProcessor from 'rest-api-handler/src/DefaultResponseProcessor';
import Api from 'rest-api-handler/src/Api';
import type { ApiResponseType } from 'rest-api-handler/src';
import decodeResponse from './decodeResponse';
import ZonkyApiException from './ZonkyApiException';
import { APP_WEB, FILE_DOWNLOAD } from './api-scopes';
import type { TransactionOrientation } from './transaction-orientations';
import type { TransactionCategory } from './transaction-categories';
import type { ApiScope } from './api-scopes';

type Token = {
    access_token: string,
    token_type: string,
    refresh_token: string,
    expires_in: number,
    scope: string,
}

type Transaction = {
    id: number,
    amount: number,
    discount: number,
    category: TransactionCategory,
    transactionDate: DateTime,
    customMessage: ?string,
    orientation: TransactionOrientation,
    loanId: number,
    loanName: string,
    nickName: string,
}

type TransactionsResponse = {
    transactions: Array<Transaction>,
    paging: {
        page: number,
        total: number,
    }
}

export default class ZonkyApi extends Api<ApiResponseType<*>> {
    refreshToken: ?string;
    tokenExpire: ?DateTime;

    static SCOPES = {
        APP_WEB,
        FILE_DOWNLOAD,
    };

    constructor() {
        super('https://api.zonky.cz', [
            new DefaultResponseProcessor(ZonkyApiException, decodeResponse),
        ], {
            Authorization: 'Basic d2ViOndlYg==',
            'Content-Type': 'application/json',
        });
    }

    setRefreshToken(token: string): this {
        this.refreshToken = token;
        return this;
    }

    getRefreshToken(): ?string {
        return this.refreshToken;
    }

    setTokenExpire(expire: DateTime): this {
        this.tokenExpire = expire;
        return this;
    }

    getTokenExpire(): ?DateTime {
        return this.tokenExpire;
    }

    async login(username: string, password: string, scope: ApiScope = APP_WEB): Promise<Token> {
        const { data } = await this.post(
            'oauth/token',
            {
                username,
                password,
                scope,
                grant_type: 'password',
            },
            ZonkyApi.FORMATS.URL_ENCODED_FORMAT,
            {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        );

        this.setDefaultHeader('Authorization', `Bearer ${data.access_token}`);
        this.setRefreshToken(data.refresh_token);
        this.setTokenExpire(DateTime.local().plus({ seconds: data.expires_in }));

        return data;
    }

    async getTransactions(from: ?DateTime, page: number = 0, size: ?number): Promise<TransactionsResponse> {
        const response = await this.get('users/me/wallet/transactions', {
            ...(from ? { 'transaction.transactionDate': from.toFormat('yyyy-MM-dd') } : {}),
        }, {
            'X-Page': page,
            ...(size ? { 'X-Size': size } : {}),
        });

        const { headers } = response.source;

        return {
            transactions: response.data.map((transaction) => {
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

    async downloadTransactions(): Promise<Buffer> {
        const { data } = await this.get('users/me/wallet/transactions/export');
        return data;
    }

    async processTransactions(
        processor: (workout: Transaction) => Promise<Transaction>,
        from: ?DateTime,
        size: number = 40,
        page: number = 0,
    ): Promise<*> {
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
