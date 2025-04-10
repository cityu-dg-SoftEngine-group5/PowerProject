import axios from 'axios'

const baseURL ='http://101.37.229.131:8080/'

const request = axios.create({
    baseURL,
    timeout: 180000
})

export default request