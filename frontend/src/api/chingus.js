import { api, apiMap } from "./axiosInstance"

// For map/aggregate endpoint - uses apiMap instance with bracket serialization
export const getChingus = async(params)=>{
    const res = await api.get('/api/chingus/aggregate-by-country',{params:{...params}});
    return res.data;
}

// For list endpoint - uses api instance without bracket serialization
export const getChingusList = async(params)=>{
    const res = await api.get('/api/chingus',{params:{...params}});
    return res.data;
}
