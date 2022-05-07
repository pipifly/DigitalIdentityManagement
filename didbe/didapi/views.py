from django.http import HttpResponse
from .models import VcMessage
import json



def sendvc(request):
  msg = json.loads(request.body)
  # print(msg)
  vc_sig = msg['vcdoc']['proof']['signature']
  to_did = msg['todid']
  try:
    if VcMessage.objects.filter(vc_sig = vc_sig, to_did = to_did, send_type=msg['type']).count() == 0:
      VcMessage.objects.create(to_did=to_did, 
                                vc_sig=vc_sig,
                                vc_doc=json.dumps(msg['vcdoc']),
                                send_type=msg['type'],
                                sent=False)
    # msg = VcMessage.objects.filter(vc_sig = vc_sig).values()
    # for ms in msg:
    #   print(ms['to_did'], ms['vc_sig'], ms['send_type'])
    return HttpResponse(True)
  except Exception as e:
    print(e)
    return HttpResponse(False)

def getvc(request):
  to_did = request.GET.get('todid', default = "")
  get_type = request.GET.get('type', default = 2)

  vcl = VcMessage.objects.filter(to_did = to_did, send_type = get_type).values()
  res = []
  for vc in vcl:
    res.append(json.loads(vc['vc_doc']))
  return HttpResponse(json.dumps(res), content_type='application/json', status=200)

# 验权
def deletevc(request):
  msg = json.loads(request.body)
  # print(msg)
  try:
    for item in msg:
      VcMessage.objects.get(vc_sig = item['vcsig'], to_did = item['todid'], send_type=item['type']).delete()
      # print()
    return HttpResponse(True)
  except Exception as e:
    print(e)
    return HttpResponse(False)


def test(request):
  return HttpResponse("ok")

def currentuser(request):

  a = {
      "success": True,
      "data": {
        'name': 'admin',
        'avatar': 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        'userid': '00000001',
        'email': 'antdesign@alipay.com',
        'signature': '海纳百川，有容乃大',
        'title': '交互专家',
        'group': '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
        'tags': [
          {
            'key': '0',
            'label': '很有想法的',
          }
        ],
        'notifyCount': 12,
        'unreadCount': 11,
        'country': 'China',
        'access': 'main',
        'geographic': {
          'province': {
            'label': '浙江省',
            'key': '330000',
          },
          'city': {
            'label': '杭州市',
            'key': '330100',
          },
        },
        'address': '西湖区工专路 77 号',
        'phone': '0752-268888888',
      },
    }
  return HttpResponse(json.dumps(a), content_type='application/json', status=200)

