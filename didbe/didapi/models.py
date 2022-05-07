from django.db import models


class Message(models.Model):
  content = models.TextField()
  create_at = models.DateTimeField(auto_now_add=True)
  room_name = models.CharField(max_length=16)

class VcMessage(models.Model):
  ID = models.AutoField(primary_key=True)
  to_did = models.CharField(max_length=200)
  vc_sig = models.CharField(max_length=200, null=True)
  vc_doc = models.TextField()

  send_type = models.IntegerField() # 0 hold 1 verify
  sent = models.BooleanField()
  # def __str__(self): 
	#   return '%s %s %s'(self.to_did, self.vc_sig, self.send_type)