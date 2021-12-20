# project_2019_vast_mc_1_group1-2019-vast-mc-1-1
# Crowdsourcing for Situational Awareness

**TEAM MEMBERS**: <br>
Sandeep Reddy Somu - 1220154260 <br>
Sai Teja Tatikonda - 1222715819 <br>
Hemanth Sinde -      1219489830 <br>
Saumya Gangwar -     1219377939 <br>
Dhrithi Chidananda - 1219433826 <br>
Saad Anwer -         1222307476 <br>

------------------------------------
**Frontend** - D3 JS, HTML, CSS

**Backend** - Python, Flask

## How to run the project:

Clone the repository using the command 
```bash
git clone https://github.com/asu-cse578-f2021/project_2019_vast_mc_1_group1-2019-vast-mc-1-1.git
```
Now change the path to the cloned folder using the command 
```bash
cd project_2019_vast_mc_1_group1-2019-vast-mc-1-1
```
Need to install a **requirements.txt** file
```bash
py -3 -m pip install -r requirements.txt
or pip install -r requirements.txt
```
Now we need to run frontend and backend simultaneously.

i) Open one terminal in the root project directory ***project_2019_vast_mc_1_group1-2019-vast-mc-1-1*** and run the below command
```bash
python -m http.server  or python3 -m http.server or py -3 -m http.server
```
Now, We can see **"Serving HTTP on :: port 8000 (http://[::]:8000/) ..."** which represents the successful start of the python server. Have this terminal open till the project completes.

ii) Now start the flask server using the following command: 

```bash
flask run (or) py -3 -m flask run
```
Now, We can see ***"Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)"*** which represents the successful start of the flask server. Have this terminal open till the project completes.

 iii) Mac environment may ask to set the FLASK_APP environment variable explicitly. Use this environment variable before step(ii).
```bash
export FLASK_APP=app.py
```

Hurray, now open a firefox browser and type below localhost url to view our project.
```bash
http://localhost:8000
```

**Thank You**
