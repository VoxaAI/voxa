export interface IBotFrameworkEntity {
    type: string;
    name?: string;
    supportsDisplay?: boolean;
    locale?: string;
}
export interface IAuthorizationResponse {
    access_token: string;
}
