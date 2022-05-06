// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function test(options?: { [key: string]: any }) {
  return request('/back_end/test/', {
    method: 'GET'
  });
  
}
