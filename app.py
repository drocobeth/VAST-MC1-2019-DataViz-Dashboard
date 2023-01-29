from flask import Flask
from flask_cors import CORS
import json
import pandas as pd
import numpy as np
app = Flask(__name__)

cors = CORS(app, resources={r"/*": {"origins": "*"}})
data=pd.read_csv('./mc1-reports-data.csv')
f = lambda x: x.median() if np.issubdtype(x.dtype, np.number) else x.mode().iloc[0]
data = data.fillna(data.groupby('location').transform(f))
data.sort_values(by='time',inplace=True,ignore_index=True)
data[['sewer_and_water', 'power','roads_and_bridges','medical','buildings','shake_intensity','location']] = data[['sewer_and_water', 'power','roads_and_bridges','medical','buildings','shake_intensity','location']].astype(float)

damageDict={
    0:"power",
  1:"roads_and_bridges",
  2:"medical",
  3:"buildings",
  4:"shake_intensity",
  5:"sewer_and_water"
}

@app.route('/getScatterData/<string:startTime>/<string:endTime>/<string:damageValue>',methods=['GET'])
def getScatterData(startTime,endTime,damageValue):
    dicts={}
    dataSlice=data[int(startTime):int(endTime)]
    dataSlice=dataSlice.filter([damageDict[int(damageValue)],'time','location'])
    dataSlice.reset_index(drop=True,inplace=True)
    topLocations=dataSlice.sort_values(by=damageDict[int(damageValue)],ascending=False).drop_duplicates('location', keep='first')['location'].to_list()
    dataSliceTopLocationSelected=dataSlice[dataSlice['location'].isin(topLocations[:4])]
    dataSliceTopLocationSelected.sort_values(by='time',inplace=True,ignore_index=True)
    dataSliceTopLocationSelected['time'] =  pd.to_datetime(dataSliceTopLocationSelected['time'])
    interval=str(round((int(endTime)-int(startTime))/60))
    clock='Min'
    if(int(interval)>60): 
        print("Interval Value:", interval)
        if(int(interval)>550):
            interval=str(2)
            clock='H'
        elif(int(interval)>1000):
            interval=str(5)
            clock='H'
        else:
            interval=str(1)
            clock='H'
        

    dataSliceTopLocationSelected=dataSliceTopLocationSelected.groupby([dataSliceTopLocationSelected.time.dt.floor(interval+clock), 'location']).mean().reset_index()
    #print(dataSliceTopLocationSelected)
    dicts['time']=dataSliceTopLocationSelected['time'].astype(str).to_list()
    dicts['location']=dataSliceTopLocationSelected['location'].to_list()
    dicts['value']=dataSliceTopLocationSelected[damageDict[int(damageValue)]].to_list()
    dicts['topLocations']=topLocations[:4]
    #dataSliceTopLocationSelected.drop(columns=['location'],inplace=True)
    #dataSliceTopLocationSelected['time']=[i for i in range(len(dataSliceTopLocationSelected))]
    return  json.dumps(dicts)

@app.route('/getgeoData/<string:startTime>/<string:endTime>',methods=['GET'])
def getgeoData(startTime,endTime):
    dicts={}
    geoSlice=data[int(startTime):int(endTime)]
 
    geoSlice.drop(columns=['time'],inplace=True)
    geoSlice.reset_index(drop=True,inplace=True)
    geoSlice=geoSlice.groupby('location').mean()
    dicts={}
    for i in range(1,20):
        try:
            dicts[i]=geoSlice.iloc[i-1].to_list()
            dicts[i]=[str(int(round(elem,2))*10) for elem in dicts[i]]
        except:
            dicts[i]=['0','0','0','0','0','0']
    return  json.dumps(dicts)

if __name__ == '__main__':
    app.debug = True
    app.run( port=5000)
