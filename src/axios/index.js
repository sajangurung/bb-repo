import axios from 'axios';
import config from '../config';

const apiHost = config.BITBUCKET_API_HOST;

export default axios.create({ baseURL: apiHost });
