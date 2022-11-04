//export const ENDPOINT_PREFIX = '/gse_backend'; // For use with proxied backend

// export const ENDPOINT_PREFIX = "https://be-asgi.azurewebsites.net";
export const ENDPOINT_PREFIX = "https://be-vendor-dev.azurewebsites.net";
export const WEATHER_PREFIX = "https://api.openweathermap.org/data/2.5/weather?units=metric";

export const AUTH_HEADER_KEY = "X-ORION-AUTH-HEADER";
export const AUTH_REFRESH_KEY = "AUTH_REFRESH_KEY";
export const AUTH_ROLE_KEY = "X-ORION-AUTH-ROLE";
export const AUTH_USER_KEY = "X-ORION-AUTH-USER";
export const AUTH_AGREEMENT_KEY = "X-ORION-AUTH-AGREEMENT";
export const AUTH_TOKEN_EXPIRE_KEY = "X-ORION-AUTH-TOKEN-EXPIRE";
export const ENCRYPTION_SECRET = "s2k0y2i1t";
export const WEATHER_SECRET = "30729f74587b07a76d210c0cfc41eaa8";

export const MOBILE_BREAKPOINT = 768;

export const TABLET_BREAKPOINT = 1450;

export const FRONTEND_TIMEOUT = 30 * 60 * 1000; //30mins
export const FRONTEND_BUFF_TIME = 2 * 1000 * 60; //2mins

export const MAX_FILE_SIZE = 5 * 1024 * 1024; //5 Mb
