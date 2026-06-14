const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";

export const tokenStorage = {
  getAccessToken: () =>
    localStorage.getItem(ACCESS_TOKEN),

  getRefreshToken: () =>
    localStorage.getItem(REFRESH_TOKEN),

  setTokens: (
    accessToken: string,
    refreshToken: string
  ) => {
    localStorage.setItem(
      ACCESS_TOKEN,
      accessToken
    );

    localStorage.setItem(
      REFRESH_TOKEN,
      refreshToken
    );
  },

  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  }
};