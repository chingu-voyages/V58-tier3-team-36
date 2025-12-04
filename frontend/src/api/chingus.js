import axios from "axios"
import { api } from "./axiosInstance"

export const getChingus = async(params)=>{
    const res = await api.get('/api/chingus/aggregate-by-country',{params:{...params}});
    return res.data;
}