<h1 align="center">Anti_phishing_plugin</h1>
<h2 align="center">Данный плагин для Google Chrome позволяет определять, фишинговый ли сайт, сохранять фишинговые ссылки в БД и предупреждать переходы на недостоверные сайты</h2>
<!--Установка-->
## Установка
1. Активируйте свою виртуальную среду

Чтобы создать и активировать виртуальную среду, откройте свой терминал и выполните следующие команды:

Create a virtual environment
```python -m venv myenv```
Activate the virtual environment
Windows
```myenv\Scripts\activate```
macOS and Linux
```source myenv/bin/activate```

2. Установите все зависимости из requirements.txt
```pip install -r requirements.txt```
3. Зайдите на https://console.cloud.google.com, в меню выберите APIs & Services -> Enabled APIs -> Cedentials -> Create Credentials, скопировать ключ, всавить его в ```app.py``` в переменную API_KEY
4. Зайти на сайт http://malware.testing.google.test/testing/malware/ и загрузить папку со скачанным проектом и в редакторе кода запустить app.py
## Видео с работой плагина: https://rutube.ru/video/private/fff63eb7e936058af693a57a67a217a1/?p=icsQgFEGBW8HOopCKEftmA
