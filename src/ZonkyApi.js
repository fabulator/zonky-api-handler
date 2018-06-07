// @flow
import { DateTime } from 'luxon';
import DefaultResponseProcessor from 'rest-api-handler/src/DefaultResponseProcessor';
import Api from 'rest-api-handler/src/Api';
import type { ApiResponseType } from 'rest-api-handler/src';
import ZonkyApiException from './ZonkyApiException';
import type { TransactionOrientation } from './transaction-orientations';
import type { TransactionCategory } from './transaction-categories';

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

    constructor() {
        super('https://api.zonky.cz', [
            new DefaultResponseProcessor(ZonkyApiException),
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

    async login(username: string, password: string): Promise<Token> {
        const { data } = await this.request('oauth/token', 'POST', {
            body: Api.convertData({
                username,
                password,
                grant_type: 'password',
                scope: 'SCOPE_APP_WEB',
            }, ZonkyApi.FORMATS.URL_ENCODED_FORMAT),
        }, {
            'Content-Type': 'application/x-www-form-urlencoded',
        });

        this.setDefaultHeader('Authorization', `Bearer ${data.access_token}`);
        this.setRefreshToken(data.refresh_token);
        this.setTokenExpire(DateTime.local().plus({ seconds: data.expires_in }));

        return data;
    }

    async getTransactions(from: ?DateTime, page: number = 0, size: ?number): Promise<TransactionsResponse> {
        const response = await this.request(`users/me/wallet/transactions${ZonkyApi.convertParametersToUrl({
            ...(from ? { [encodeURI('transaction.transactionDate')]: from.toFormat('yyyy-MM-dd') } : {}),
        })}`, 'GET', {

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

    async processTransactions(
        processor: (workout: Workout) => Promise<Workout>,
        from: ?DateTime,
        size: number = 40,
        page: number = 0,
    ): Promise<TransactionsResponse> {
        const { transactions, paging } = await this.getTransactions(from, page, size);

        const processorPromises = transactions.map((transaction) => {
            return processor(transaction);
        });

        if (paging.total > (paging.page + 1) * size) {
            processorPromises.push(...await this.processTransactions(processor, from, size, page + 1));
        }

        return Promise.all(processorPromises);
    }
}
