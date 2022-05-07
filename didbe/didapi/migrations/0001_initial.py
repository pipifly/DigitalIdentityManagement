# Generated by Django 4.0.4 on 2022-05-07 12:49

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('create_at', models.DateTimeField(auto_now_add=True)),
                ('room_name', models.CharField(max_length=16)),
            ],
        ),
        migrations.CreateModel(
            name='VcMessage',
            fields=[
                ('ID', models.AutoField(primary_key=True, serialize=False)),
                ('to_did', models.CharField(max_length=200)),
                ('vc_sig', models.CharField(max_length=200, null=True)),
                ('vc_doc', models.TextField()),
                ('send_type', models.IntegerField()),
                ('sent', models.BooleanField()),
            ],
        ),
    ]
