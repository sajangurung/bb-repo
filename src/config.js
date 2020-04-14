const { OAUTH_CLIENT_ID, ORG_NAME } = process.env;
const config = {
  OAUTH_CLIENT_ID,
  ORG_NAME,
  BITBUCKET_API_HOST: 'https://api.bitbucket.org/2.0/',
  BITBUCKET_LOGIN_REDIRECT: `https://bitbucket.org/site/oauth2/authorize?client_id=${OAUTH_CLIENT_ID}&response_type=token`,
};

export default config;
