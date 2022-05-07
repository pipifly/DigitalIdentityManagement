from django.urls import path

from . import views

urlpatterns = [
    path('test', views.test, name='test'),
    path('currentuser', views.currentuser, name='currentuser'),
    path('sendvc', views.sendvc, name='sendvc'),
    path('getvc', views.getvc, name='getvc'),
    path('deletevc', views.deletevc, name='deletevc'),
]
