import axios from 'axios';
import { FETCH_USER } from './types';

export const fetchUser = () => async (dispatch) => {
    let res = await axios.get('http://localhost:5000/api/current_user');
    dispatch({ type: FETCH_USER, payload: res.data });
}