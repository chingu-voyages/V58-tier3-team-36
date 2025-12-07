import { api } from "./axiosInstance"

export const getChingus = async(params)=>{
    const res = await api.get('/api/chingus/aggregate-by-country',{params:{...params}});
    return res.data;
}

export const getChingusList = async(params)=>{
    const res = await api.get('/api/chingus',{params:{...params}});
    return res.data;
}
