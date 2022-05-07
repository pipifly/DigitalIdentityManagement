// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function test(options?: { [key: string]: any }) {
  return request('/back_end/test', {
    method: 'GET'
  });
  
}

export async function sendVc(body: DID.SendVcParms, options?: { [key: string]: any}) {
  return request<boolean>('/back_end/sendvc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
  
}

export async function getVc(
  params: {
    todid?: string;
    type?: number;
  },
  options?: { [key: string]: any },
) {
  return request<DID.VcDocument[]>('/back_end/getvc', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

export async function deleteVc(body: {
  todid?: string;
  vcsig?: string;
  type?: number;
}[], options?: { [key: string]: any}) {
  return request<boolean>('/back_end/deletevc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}