import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import ReactTooltip from 'react-tooltip';

import LinearGradient from './LinearGradient.js';
import './mapstyle.css';

const INDIA_TOPO_JSON = require('./india.topo.json');
const PROJECTION_CONFIG = {
  scale: 350,
  center: [78.9629, 22.5937] // always in [East Latitude, North Longitude]
};

// Red Variants
const COLOR_RANGE = [
  '#ffe5e5',
  '#ffcccc',
  '#ffb2b2',
  '#ff9999',
  '#ff7f7f',
  '#ff6666',
  '#ff4c4c',
  '#ff3232',
  '#ff1919',
  '#ff0000',
  '#e50000',
  '#cc0000',
  '#b20000',
  '#990000',
  '#7f0000',
  '#660000',
  '#4c0000',
  '#330000',
  '#190000'
  ];


const DEFAULT_COLOR = '#EEE';

const geographyStyle = {
default: {
    outline: 'none'
},
hover: {
    fill: '#ccc',
    transition: 'all 250ms',
    outline: 'none'
},
pressed: {
    outline: 'none'
}
};


let heatMapListConfirmed = [{}]
let heatMapListDeceased = [{}]
let heatMapListRecovered = [{}]
let flag = false;

function Choropleth({dataset})
{   
    //console.log(dataset)
    if(dataset!= null && !flag)
    {
        dataset.forEach(element => {
            if(!(element["state"] === 'Total' || element['state'] === 'State Unassigned'))
            {
                heatMapListConfirmed.push({
                id: element["statecode"],
                state: element["state"],
                value: element["confirmed"]
            })
        }  
        });
        
        heatMapListConfirmed = heatMapListConfirmed.slice(1);

        dataset.forEach(element => {
          if(!(element["state"] === 'Total' || element['state'] === 'State Unassigned'))
          {
              heatMapListDeceased.push({
              id: element["statecode"],
              state: element["state"],
              value: element["deaths"]
          })
      }  
      });
      heatMapListDeceased = heatMapListDeceased.slice(1);


      dataset.forEach(element => 
      {
        if(!(element["state"] === 'Total' || element['state'] === 'State Unassigned'))
        {
            heatMapListRecovered.push({
            id: element["statecode"],
            state: element["state"],
            value: element["recovered"]
        })
        }  
      });
      heatMapListRecovered = heatMapListRecovered.slice(1);
        //console.log(heatMapList)
        flag = true;
    }

    const getHeatMapDataRecovered = () => 
    {
        return heatMapListRecovered;
    }
    const getHeatMapDataConfirmed = () => 
    {
      //console.log(heatMapListConfirmed)
      return heatMapListConfirmed;
    }

  const getHeatMapDataDeaths = () => 
  {
    return heatMapListDeceased;
  }

    const [tooltipContent, setTooltipContent] = useState('');
    const [data, setData] = useState(getHeatMapDataConfirmed());

     
    const gradientData = 
    {
      fromColor: COLOR_RANGE[0],
      toColor: COLOR_RANGE[COLOR_RANGE.length - 1],
      min: 0,
      max: data[0].value 
    };
    
    const colorScale = scaleQuantile()
      .domain(data.map(d => d.value))
      .range(COLOR_RANGE);
  
    const onMouseEnter = (geo, current = { value: 'NA' }) => {
      return () => {
        setTooltipContent(`${geo.properties.name}: ${current.value}`);
      };
    };
  
    const onMouseLeave = () => {
      setTooltipContent('');
    };
  
    const selectGraph = (e) => {
      e.preventDefault()
      if (e.target.value === 'red') setData(getHeatMapDataConfirmed())
      if (e.target.value === 'green') setData(getHeatMapDataRecovered());
      if (e.target.value === 'blue') setData(getHeatMapDataDeaths());
  }

   
  
    return (
        <div className="full-width-height container">
        <h1 className="no-margin center">COVID-19 CHOROPLETH INDIA</h1>
        <div className={'buttonsGrp'}>
                    <div className={'buttons'}>
                        <button onClick={selectGraph} value='red' className={'redBtn'}>Confirmed</button>
                        <button onClick={selectGraph} value='green' className={'greenBtn'}>Recovered</button>
                        <button onClick={selectGraph} value='blue' className={'blueBtn'}>Deceased</button>
                    </div>
                    
                </div>
        <ReactTooltip>{tooltipContent}</ReactTooltip>
          <ComposableMap
            projectionConfig={PROJECTION_CONFIG}
            projection="geoMercator"
            width={600}
            height={220}
            data-tip=""
          >
            <Geographies geography={INDIA_TOPO_JSON}>
              {({ geographies }) =>
                geographies.map(geo => {
                  //console.log(geo.id);
                  const current = data.find(s => s.id === geo.id);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={current ? colorScale(current.value) : DEFAULT_COLOR}
                      style={geographyStyle}
                      onMouseEnter={onMouseEnter(geo, current)}
                      onMouseLeave={onMouseLeave}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          <LinearGradient data={gradientData} />
          
      </div>
    );
  }

  export default Choropleth;
