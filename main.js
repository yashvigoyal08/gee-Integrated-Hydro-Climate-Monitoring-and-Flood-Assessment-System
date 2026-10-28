// ============================================================================
// LOAD ODISHA DISTRICTS
// ============================================================================

var districts = ee.FeatureCollection('FAO/GAUL/2015/level2')

  .filter(ee.Filter.eq('ADM0_NAME', 'India'))

  .filter(ee.Filter.eq('ADM1_NAME', 'Orissa'));

// ============================================================================
// DISTRICT LIST
// ============================================================================

var districtNames = [

  'Angul',
  'Baleshwar',
  'Baragarh',
  'Bhadrak',
  'Bolangir',
  'Boudh',
  'Cuttack',
  'Deogarh',
  'Dhenkanal',
  'Gajapati',
  'Ganjam',
  'Jagatsinghpur',
  'Jajpur',
  'Jharsuguda',
  'Kalahandi',
  'Kandhamal',
  'Kendrapara',
  'Keonjhar',
  'Khordha',
  'Koraput',
  'Malkangiri',
  'Mayurbhanj',
  'Nabarangpur',
  'Nayagarh',
  'Nuapada',
  'Puri',
  'Rayagada',
  'Sambalpur',
  'Sonepur',
  'Sundargarh'
];

// ============================================================================
// VISUALIZATION PARAMETERS
// ============================================================================

var visParams = {

  NDVI: {
    min: -0.2,
    max: 1,
    palette: [
      '#8b0000',
      '#ff0000',
      '#ff9900',
      '#ffff00',
      '#a6d96a',
      '#1a9850',
      '#006400'
    ]
  },

  EVI: {
    min: -1,
    max: 1,
    palette: [
      '#f7fcf0',
      '#ccebc5',
      '#7bccc4',
      '#006d2c'
    ]
  },

  SAVI: {
    min: -1,
    max: 1,
    palette: [
      '#8c510a',
      '#d8b365',
      '#5ab4ac',
      '#01665e'
    ]
  },

  NDWI: {
    min: -1,
    max: 1,
    palette: [
      '#8c510a',
      '#dfc27d',
      '#80cdc1',
      '#018571'
    ]
  },

  GNDVI: {
    min: -1,
    max: 1,
    palette: [
      '#d73027',
      '#fee08b',
      '#91cf60',
      '#1a9850'
    ]
  },

  NDBI: {
    min: -1,
    max: 1,
    palette: [
      '#2166ac',
      '#67a9cf',
      '#f7f7f7',
      '#f4a582',
      '#b2182b'
    ]
  },

  NDMI: {
    min: -1,
    max: 1,
    palette: [
      '#d73027',
      '#fdae61',
      '#abd9e9',
      '#2c7bb6'
    ]
  }

};
// ============================================================================
// LEGEND INFO
// ============================================================================

var legendInfo = {

  NDVI: {
    names: [
      '<0',
      '0-0.2',
      '0.2-0.3',
      '0.3-0.5',
      '0.5-0.6',
      '0.6-0.7',
      '>0.7'
    ]
  },

  EVI: {
    names: [
      '<0.1',
      '0.1-0.3',
      '0.3-0.5',
      '>0.5'
    ]
  },

  SAVI: {
    names: [
      '<0.1',
      '0.1-0.3',
      '0.3-0.5',
      '>0.5'
    ]
  },

  NDWI: {
    names: [
      '<0',
      '0-0.2',
      '0.2-0.4',
      '>0.4'
    ]
  },

  GNDVI: {
    names: [
      '<0.2',
      '0.2-0.5',
      '0.5-0.7',
      '>0.7'
    ]
  },

  NDBI: {
    names: [
      '<-0.1',
      '-0.1-0',
      '0-0.2',
      '0.2-0.4',
      '>0.4'
    ]
  },

  NDMI: {
    names: [
      '<-0.2',
      '-0.2-0',
      '0-0.3',
      '>0.3'
    ]
  }

};
// ============================================================================
// RGB VIS
// ============================================================================

var rgbVis = {

  bands: ['B4', 'B3', 'B2'],

  min: 0,

  max: 0.3

};
// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

var currentIndexImage = null;

var currentRegion = null;

var chartPanel = null;
// ===================================
// GLOBAL VARIABLES
// ===================================

var currentFloodClass = null;

var currentRegion = null;

var currentDistrict = null;
var currentComposite = null;
// ============================================================================
// CLOUD MASK FUNCTION
// ============================================================================

function maskS2clouds(image) {

  var qa = image.select('QA60');

  var cloudBitMask = 1 << 10;

  var cirrusBitMask = 1 << 11;

  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)

      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask)

      .divide(10000)

      .copyProperties(image, ['system:time_start']);
}
// ============================================================================
// TITLE
// ============================================================================

var headerPanel = ui.Panel({
  style:{
    backgroundColor:'#0d47a1',
    padding:'3px',
    margin:'0px',
    stretch:'horizontal'
  }
});


var headerTitle = ui.Label({
  value:'🌎 Integrated Environmental Monitoring and Flood Assessment System (IEMFAS) for Odissa', 
  style:{
    fontSize:'20px',
    fontWeight:'bold',
    color:'red'
  }
});




headerPanel.add(headerTitle);

// ==========================================
// MODULE BUTTONS
// ==========================================

var indexModuleBtn = ui.Button({
  label:'🌿 Indices',
  style:{
    stretch:'horizontal',
    backgroundColor:'#1b5e20',
    color:'blue',
    fontWeight:'bold'
  }
});

var waterModuleBtn = ui.Button({
  label:'💧 Waterlogging',
  style:{
    stretch:'horizontal',
    backgroundColor:'#757575',
    color:'blue',
    fontWeight:'bold'
    
  }
});

var floodModuleBtn = ui.Button({
  label:'🌊 Flood Hazard',
  style:{
    stretch:'horizontal',
    backgroundColor:'#757575',
    color:'blue',
    fontWeight:'bold'
  }
});
var moduleBar = ui.Panel(
  [
    indexModuleBtn,
    waterModuleBtn,
    floodModuleBtn
  ],
  ui.Panel.Layout.Flow('horizontal'),
  {
    stretch:'horizontal'
  }
);
function showModule(module){

  indexPanel.style().set(
    'shown',
    module === 'index'
  );

  waterPanel.style().set(
    'shown',
    module === 'water'
  );

  floodPanel.style().set(
    'shown',
    module === 'flood'
  );

  // Active button color

  indexModuleBtn.style().set(
    'backgroundColor',
    module === 'index'
    ? '#1b5e20'
    : '#757575'
  );

  waterModuleBtn.style().set(
    'backgroundColor',
    module === 'water'
    ? '#1565c0'
    : '#757575'
  );

  floodModuleBtn.style().set(
    'backgroundColor',
    module === 'flood'
    ? '#c62828'
    : '#757575'
  );
}
var infoButton = ui.Button({
  label:'ℹ About App',
  style:{
    stretch:'horizontal',
    backgroundColor:'#1976d2',
    color:'green',
    fontWeight:'bold',
    padding:'8px'
  }
});
var infoPanel = ui.Panel({
  style:{
    position:'bottom-right',
    width:'550px',
    height:'650px',
    padding:'15px',
    backgroundColor:'white',
    border:'1px solid #cccccc',
    shown:false
  }
});

infoPanel.add(
ui.Label({
  value:'🌍 Integrated Environmental Monitoring and Flood Assessment System (IEMFAS) for Odisha',
  style:{
    fontSize:'18px',
    fontWeight:'bold',
    color:'#0d47a1'
  }
}));

infoPanel.add(
ui.Label({
  value:
  'A cloud-based Remote Sensing and GIS Decision Support System developed on Google Earth Engine for environmental monitoring, waterlogging assessment, and flood susceptibility analysis across Odisha.\n\n' +

  'The platform integrates multi-source satellite datasets to support environmental management, flood risk assessment, and disaster resilience planning.',
  style:{
    whiteSpace:'pre-wrap',
    fontSize:'12px'
  }
}));

infoPanel.add(
ui.Label({
  value:'📌 AVAILABLE MODULES',
  style:{
    fontWeight:'bold',
    color:'#0d47a1',
    margin:'10px 0 5px 0'
  }
}));

infoPanel.add(
ui.Label({
  value:

'🌿 ENVIRONMENTAL INDICES\n' +
'• NDVI, EVI, SAVI\n' +
'• GNDVI, NDWI, NDBI, NDMI\n' +
'• Time Series Analysis\n' +
'• Multi-Year Trend Analysis\n' +
'• Change Detection\n' +
'• GIF Generation\n\n' +

'💧 WATERLOGGING ASSESSMENT\n' +
'• Hybrid Waterlogging Mapping\n' +
'• Permanent Water Detection\n' +
'• Seasonal Waterlogging Detection\n' +
'• Paddy/Moist Soil Identification\n' +
'• Area Statistics\n\n' +

'🌊 FLOOD HAZARD ANALYSIS\n' +
'• Elevation & Slope Analysis\n' +
'• Rainfall Analysis\n' +
'• Soil Moisture Analysis\n' +
'• River Proximity Analysis\n' +
'• Flow Accumulation Analysis\n' +
'• Land Use/Land Cover Analysis\n' +
'• NDWI & TWI Analysis\n' +
'• Population Exposure Assessment\n' +
'• Agriculture Exposure Assessment',

  style:{
    whiteSpace:'pre-wrap',
    fontSize:'12px'
  }
}));

infoPanel.add(
ui.Label({
  value:'🛰 DATA SOURCES',
  style:{
    fontWeight:'bold',
    color:'#0d47a1',
    margin:'10px 0 5px 0'
  }
}));

infoPanel.add(
ui.Label({
  value:

'• Sentinel-2 MSI\n' +
'• Sentinel-1 SAR\n' +
'• CHIRPS Rainfall\n' +
'• SRTM DEM\n' +
'• HydroSHEDS\n' +
'• NASA FLDAS\n' +
'• ESA WorldCover\n' +
'• JRC Global Surface Water\n' +
'• WorldPop Population Dataset',

  style:{
    whiteSpace:'pre-wrap',
    fontSize:'12px'
  }
}));

infoPanel.add(
ui.Label({
  value:'👨‍💻 DEVELOPER INFORMATION',
  style:{
    fontWeight:'bold',
    color:'#0d47a1',
    margin:'10px 0 5px 0'
  }
}));

infoPanel.add(
ui.Label({
  value:

'Developed By:\n' +
'Yashvi Goyal\n\n' +

'M.Tech Student\n' +
'Indian Institute of Technology (IIT) Kharagpur\n\n' +

'Internship Organization:\n' +
'National Institute of Hydrology (NIH), Roorkee\n\n' +

'Supervisor:\n' +
'Dr. D. S. Bisht\n\n' +

'Project Type:\n' +
'M.Tech Internship Research Project',

  style:{
    whiteSpace:'pre-wrap',
    fontSize:'12px'
  }
}));
var closeInfoButton = ui.Button({
  label:'✖ Close',
  style:{
    backgroundColor:'#c62828',
    color:'red',
    fontWeight:'bold'
  }
});

closeInfoButton.onClick(function(){

  infoPanel.style().set(
    'shown',
    false
  );

});


ui.root.add(infoPanel);
infoPanel.add(closeInfoButton);
var waterInfoPanel = ui.Panel({
  style:{
    position:'bottom-right',
    width:'600px',
    height:'650px',
    padding:'15px',
    backgroundColor:'white',
    border:'2px solid #1565c0',
    shown:false
  }
});

waterInfoPanel.add(
  ui.Label({
    value:'💧 Hybrid Waterlogging Mapping Workflow',
    style:{
      fontSize:'18px',
      fontWeight:'bold',
      color:'#1565c0'
    }
  })
);
var downloadLinkLabel = ui.Label({
  value: '',
  style: {
    color: 'blue',
    textDecoration: 'underline'
  }
});
// ============================================================================
// UI CONTROLS
// ============================================================================

var districtSelect = ui.Select({

  items: districtNames,

  value: 'Khordha',

  style: {stretch: 'horizontal'}

});


var yearSelect = ui.Select({

  items: ['2019','2020','2021','2022','2023','2024','2025'],

  value: '2024',

  style: {stretch: 'horizontal'}

});


var monthSelect = ui.Select({

  items: [

    '01','02','03','04','05','06',

    '07','08','09','10','11','12'

  ],

  value: '11',

  style: {stretch: 'horizontal'}

});


var indexSelect = ui.Select({

  items: [

    'NDVI',

    'EVI',

    'SAVI',

    'NDWI',

    'GNDVI',

    'NDBI',

    'NDMI'

  ],

  value: 'NDVI',

  style: {stretch: 'horizontal'}

});


var cloudSlider = ui.Slider({

  min: 0,

  max: 100,

  value: 60,

  step: 5,

  style: {stretch: 'horizontal'}

});
//generate waterlogging map
var currentWaterloggingMap = null;


function generateWaterloggingMNDWI(){

  statusLabel.setValue(
  'Processing Hybrid Waterlogging...');

  Map.clear();
  Map.add(legend);

  var districtName =
      districtSelect.getValue();

  var year =
      yearSelect.getValue();

  var month =
      monthSelect.getValue();

  var selectedDistrict =
      districts.filter(
      ee.Filter.eq(
      'ADM2_NAME',
      districtName));

  var region =
      selectedDistrict.geometry();

  currentRegion = region;

  Map.centerObject(region,9);

  var startDate =
      ee.Date(
      year + '-' + month + '-01');

  var endDate =
      startDate.advance(1,'month');

  // ==========================
  // Sentinel-2
  // ==========================

  var s2 =
      ee.ImageCollection(
      'COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(region)
      .filterDate(startDate,endDate)
      .filter(
      ee.Filter.lt(
      'CLOUDY_PIXEL_PERCENTAGE',
      40))
      .map(maskS2clouds);

  var image =
      s2.median()
      .clip(region);

  // ==========================
  // Sentinel-2 Indices
  // ==========================

  var mndwi =
      image.normalizedDifference(
      ['B3','B11']);

  var ndmi =
      image.normalizedDifference(
      ['B8','B11']);

  var ndvi =
      image.normalizedDifference(
      ['B8','B4']);

  // ==========================
  // Sentinel-1
  // ==========================

  var s1 =
      ee.ImageCollection(
      'COPERNICUS/S1_GRD')
      .filterBounds(region)
      .filterDate(startDate,endDate)
      .filter(
      ee.Filter.eq(
      'instrumentMode',
      'IW'))
      .filter(
      ee.Filter.listContains(
      'transmitterReceiverPolarisation',
      'VV'))
      .filter(
      ee.Filter.listContains(
      'transmitterReceiverPolarisation',
      'VH'))
      .select(['VV','VH']);

  var sar =
      s1.median()
      .clip(region);

  var vv =
      sar.select('VV');

  var vh =
      sar.select('VH');

  // ==========================
  // DEM + Slope
  // ==========================

  var dem =
      ee.Image(
      'USGS/SRTMGL1_003');

  var slope =
      ee.Terrain.slope(dem);

  // ==========================
  // Permanent Water
  // ==========================

  var permanentWater =

      mndwi.gt(0.10)
      .and(vv.lt(-14))
      .and(vh.lt(-20))
      .and(ndvi.lt(0.30));

  // ==========================
  // Seasonal Waterlogging
  // ==========================

  var seasonalWater =

      mndwi.gt(-0.05)
      .and(ndmi.gt(0.15))
      .and(vv.lt(-11))
      .and(vh.lt(-17))
      .and(ndvi.lt(0.55))
      .and(slope.lt(5))
      .and(permanentWater.not());

  // ==========================
  // Paddy Water
  // ==========================

  var paddyWater =

      ndvi.gt(0.35)
      .and(ndvi.lt(0.85))
      .and(ndmi.gt(0.10))
      .and(vh.lt(-16))
      .and(slope.lt(3))
      .and(permanentWater.not())
      .and(seasonalWater.not());

  // ==========================
  // Classification
  // ==========================

  var waterClass =
      ee.Image(1)

      .where(
      paddyWater,
      2)

      .where(
      seasonalWater,
      3)

      .where(
      permanentWater,
      4)

      .clip(region);

  waterClass =
      waterClass.focal_mode({
      radius:1,
      units:'pixels'
      });

  Map.addLayer(
      waterClass,
      {
      min:1,
      max:4,
      palette:[
      '00AA00',
      'FFFF00',
      'FF0000',
      '0000FF'
      ]
      },
      'Hybrid Waterlogging');
      currentWaterloggingMap = waterClass;


  Map.addLayer(
      selectedDistrict.style({
      color:'white',
      fillColor:'00000000',
      width:2
      }),
      {},
      'District Boundary');
//==========================================
// AREA STATISTICS
//==========================================
statsLabel.setValue(
  'Calculating Area Statistics...'
);
// Pixel area in hectares
var areaImage = ee.Image.pixelArea().divide(10000);

// Class 1 : Non Waterlogged
var nonWater = areaImage.updateMask(
  waterClass.eq(1)
).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: region,
  scale: 10,
  maxPixels: 1e13
});

// Class 2 : Paddy / Moist Soil
var paddy = areaImage.updateMask(
  waterClass.eq(2)
).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: region,
  scale: 10,
  maxPixels: 1e13
});

// Class 3 : Seasonal Waterlogging
var seasonal = areaImage.updateMask(
  waterClass.eq(3)
).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: region,
  scale: 10,
  maxPixels: 1e13
});

// Class 4 : Permanent Water
var permanent = areaImage.updateMask(
  waterClass.eq(4)
).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: region,
  scale: 10,
  maxPixels: 1e13
});

// District total area
var totalArea = areaImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: region,
  scale: 10,
  maxPixels: 1e13
});

// Display statistics
ee.Dictionary({
  non: ee.Number(nonWater.get('area',0)),
  paddy: ee.Number(paddy.get('area',0)),
  seasonal: ee.Number(seasonal.get('area',0)),
  permanent: ee.Number(permanent.get('area',0)),
  total: ee.Number(totalArea.get('area',0))
}).evaluate(function(result){

  if(!result){
    statsLabel.setValue(
      'Unable to calculate area statistics.'
    );
    return;
  }

  statsLabel.setValue(

    'HYBRID WATERLOGGING STATISTICS\n\n' +

    'District : ' + districtName + '\n\n' +

    'Total Area : ' +
    Number(result.total).toFixed(2) +
    ' ha\n\n' +

    'Non Waterlogged : ' +
    Number(result.non || 0).toFixed(2) +
    ' ha\n\n' +

    'Paddy / Moist Soil : ' +
    Number(result.paddy || 0).toFixed(2) +
    ' ha\n\n' +

    'Seasonal Waterlogging : ' +
    Number(result.seasonal || 0).toFixed(2) +
    ' ha\n\n' +

    'Permanent Water : ' +
    Number(result.permanent || 0).toFixed(2) +
    ' ha'

  );

});
  legend.clear();

  legend.add(ui.Label({
    value:'Hybrid Waterlogging',
    style:{
      fontWeight:'bold'
    }
  }));

  var colors =
      ['00AA00','FFFF00',
       'FF0000','0000FF'];

  var labels =

      ['Non Waterlogged',
       'Paddy / Moist Soil',
       'Seasonal Waterlogging',
       'Permanent Water'];

  for(var i=0;i<4;i++){

    legend.add(
      ui.Panel([
        ui.Label('',{
          backgroundColor:'#'+colors[i],
          padding:'8px'
        }),
        ui.Label(labels[i])
      ],
      ui.Panel.Layout.Flow(
      'horizontal'))
    );
  }

  statusLabel.setValue(
  'Hybrid Waterlogging Completed');

}
//flood susceptibilty legend
function updateFloodLegend(){

  legend.clear();

  legend.add(ui.Label({
    value:'Flood Hazard',
    style:{
      fontWeight:'bold',
      fontSize:'14px'
    }
  }));

  var colors = [
     '#d6f0ff',
  '#92d4ff',
  '#4da6ff',
  '#0066cc',
  '#001f66'  ];

  var labels = [
    'Very Low',
    'Low',
    'Moderate',
    'High',
    'Very High'
  ];

  for(var i=0;i<colors.length;i++){

    legend.add(
      ui.Panel([
        ui.Label('',{
          backgroundColor:colors[i],
          padding:'8px'
        }),
        ui.Label(labels[i])
      ],
      ui.Panel.Layout.Flow('horizontal'))
    );
  }
}
waterInfoPanel.add(
ui.Label({
value:

'💧 HYBRID WATERLOGGING MAPPING METHODOLOGY\n\n' +

'STEP 1: STUDY AREA SELECTION\n' +
'District, Year and Month selected by user.\n\n' +

'⬇\n\n' +

'STEP 2: SENTINEL-2 DATA PROCESSING\n' +
'• Cloud masking using QA60 band\n' +
'• Monthly median composite generation\n' +
'• Surface Reflectance preprocessing\n\n' +

'⬇\n\n' +

'STEP 3: CALCULATION OF SPECTRAL INDICES\n\n' +

'MNDWI = (Green - SWIR) / (Green + SWIR)\n' +
'Purpose:\n' +
'• Detect open water bodies\n' +
'• Enhance water while suppressing built-up areas\n\n' +

'NDMI = (NIR - SWIR) / (NIR + SWIR)\n' +
'Purpose:\n' +
'• Detect soil and vegetation moisture\n' +
'• Identify saturated land conditions\n\n' +

'NDVI = (NIR - Red) / (NIR + Red)\n' +
'Purpose:\n' +
'• Measure vegetation health and density\n' +
'• Differentiate crops from waterlogged land\n\n' +

'⬇\n\n' +

'STEP 4: SENTINEL-1 SAR PROCESSING\n\n' +

'VV Polarization\n' +
'• Sensitive to surface water\n' +
'• Water surfaces produce low backscatter\n\n' +

'VH Polarization\n' +
'• Sensitive to vegetation structure\n' +
'• Useful for identifying paddy fields\n\n' +

'Monthly SAR median composite generated.\n\n' +

'⬇\n\n' +

'STEP 5: TERRAIN ANALYSIS\n\n' +

'SRTM DEM\n' +
'⬇\n' +
'Slope Generation\n\n' +

'Purpose:\n' +
'• Waterlogging generally occurs on flat terrain\n' +
'• Steeper slopes are excluded\n\n' +

'⬇\n\n' +

'STEP 6: PERMANENT WATER DETECTION\n\n' +

'Conditions:\n' +
'MNDWI > 0.10\n' +
'VV < -14 dB\n' +
'VH < -20 dB\n' +
'NDVI < 0.30\n\n' +

'Reason:\n' +
'• Strong water signal\n' +
'• Very low vegetation cover\n' +
'• Very low radar backscatter\n\n' +

'Output:\n' +
'Permanent Water Bodies\n\n' +

'⬇\n\n' +

'STEP 7: SEASONAL WATERLOGGING DETECTION\n\n' +

'Conditions:\n' +
'MNDWI > -0.05\n' +
'NDMI > 0.15\n' +
'VV < -11 dB\n' +
'VH < -17 dB\n' +
'NDVI < 0.55\n' +
'Slope < 5°\n\n' +

'Reason:\n' +
'• Wet surface present\n' +
'• High moisture content\n' +
'• Low vegetation cover\n' +
'• Flat topography\n\n' +

'Output:\n' +
'Seasonally Waterlogged Areas\n\n' +

'⬇\n\n' +

'STEP 8: PADDY FIELD IDENTIFICATION\n\n' +

'Conditions:\n' +
'NDVI > 0.35\n' +
'NDVI < 0.85\n' +
'NDMI > 0.10\n' +
'VH < -16 dB\n' +
'Slope < 3°\n\n' +

'Reason:\n' +
'• Paddy contains healthy green vegetation\n' +
'• Paddy remains moisture rich\n' +
'• Standing water lowers VH backscatter\n' +
'• Rice cultivation occurs on flat land\n\n' +

'WHY PADDY IS NOT WATERLOGGING?\n\n' +

'Waterlogged Areas:\n' +
'• Low vegetation cover\n' +
'• NDVI generally low\n' +
'• Crop growth absent or stressed\n\n' +

'Paddy Fields:\n' +
'• High vegetation cover\n' +
'• NDVI generally high\n' +
'• Active crop growth present\n\n' +

'NDVI is the primary parameter used to separate paddy from waterlogged land.\n\n' +

'⬇\n\n' +

'STEP 9: HYBRID CLASSIFICATION\n\n' +

'Class 1 : Non Waterlogged\n' +
'Class 2 : Paddy / Moist Soil\n' +
'Class 3 : Seasonal Waterlogging\n' +
'Class 4 : Permanent Water\n\n' +

'⬇\n\n' +

'STEP 10: POST PROCESSING\n\n' +

'Majority Filter (Focal Mode)\n' +
'Applied to remove isolated pixels and noise.\n\n' +

'⬇\n\n' +

'STEP 11: AREA STATISTICS\n\n' +

'Area calculated for:\n' +
'• Non Waterlogged\n' +
'• Paddy / Moist Soil\n' +
'• Seasonal Waterlogging\n' +
'• Permanent Water\n\n' +

'⬇\n\n' +

'FINAL OUTPUT\n\n' +

'Hybrid Waterlogging Map + Area Statistics',

style:{
whiteSpace:'pre-wrap',
fontSize:'12px'
}
}));
var closeWaterInfoButton = ui.Button({
  label:'✖ Close',
  style:{
    backgroundColor:'#c62828',
    color:'red',
    fontWeight:'bold'
  }
});

closeWaterInfoButton.onClick(function(){
  waterInfoPanel.style().set('shown',false);
});

waterInfoPanel.add(closeWaterInfoButton);

ui.root.add(waterInfoPanel);

//Flood susceptibilty function
function generateFloodSusceptibility(){

  statusLabel.setValue(
    'Generating Flood Susceptibility Map and Analysis....'
  );

  Map.clear();
  Map.add(legend);

  updateFloodLegend();

  var districtName =
      districtSelect.getValue();

  var selectedDistrict =
      districts.filter(
      ee.Filter.eq(
      'ADM2_NAME',
      districtName));

  var region =
      selectedDistrict.geometry();

  Map.centerObject(region,9);

  // =====================================================
  // DEM
  // =====================================================

  var dem =
      ee.Image('USGS/SRTMGL1_003')
      .clip(region);

  var elevationRisk =
      ee.Image(1)
      .where(dem.lt(20),5)
      .where(dem.gte(20).and(dem.lt(50)),4)
      .where(dem.gte(50).and(dem.lt(100)),3)
      .where(dem.gte(100).and(dem.lt(200)),2)
      .where(dem.gte(200),1);

  // =====================================================
  // SLOPE
  // =====================================================

  var slope =
      ee.Terrain.slope(dem);

  var slopeRisk =
      ee.Image(1)
      .where(slope.lt(2),5)
      .where(slope.gte(2).and(slope.lt(5)),4)
      .where(slope.gte(5).and(slope.lt(10)),3)
      .where(slope.gte(10).and(slope.lt(20)),2)
      .where(slope.gte(20),1);

  // =====================================================
  // RAINFALL
  // =====================================================

  var rainfall =
      ee.ImageCollection(
      'UCSB-CHG/CHIRPS/DAILY')
      .filterDate(
      '2024-01-01',
      '2024-12-31')
      .sum()
      .clip(region);

  var rainRisk =
      ee.Image(1)
      .where(rainfall.gt(1800),5)
      .where(rainfall.gt(1400)
      .and(rainfall.lte(1800)),4)
      .where(rainfall.gt(1000)
      .and(rainfall.lte(1400)),3)
      .where(rainfall.gt(600)
      .and(rainfall.lte(1000)),2)
      .where(rainfall.lte(600),1);

  // =====================================================
  // NDWI
  // =====================================================

  var s2 =
      ee.ImageCollection(
      'COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(region)
      .filterDate(
      '2024-01-01',
      '2024-12-31')
      .filter(
      ee.Filter.lt(
      'CLOUDY_PIXEL_PERCENTAGE',
      20))
      .median()
      .clip(region);

  var ndwi =
      s2.normalizedDifference(
      ['B3','B8']);

  var ndwiRisk =
      ee.Image(1)
      .where(ndwi.gt(0.4),5)
      .where(ndwi.gt(0.2)
      .and(ndwi.lte(0.4)),4)
      .where(ndwi.gt(0)
      .and(ndwi.lte(0.2)),3)
      .where(ndwi.gt(-0.2)
      .and(ndwi.lte(0)),2)
      .where(ndwi.lte(-0.2),1);
  var water = ee.Image('JRC/GSW1_4/GlobalSurfaceWater')
               .select('occurrence');

var riverMask = water.gt(50);

var distanceRiver =
    riverMask.fastDistanceTransform()
    .sqrt()
    .multiply(30);

var riverRisk =
    ee.Image(1)
    .where(distanceRiver.lt(500),5)
    .where(distanceRiver.gte(500)
    .and(distanceRiver.lt(1000)),4)
    .where(distanceRiver.gte(1000)
    .and(distanceRiver.lt(2000)),3)
    .where(distanceRiver.gte(2000)
    .and(distanceRiver.lt(5000)),2)
    .where(distanceRiver.gte(5000),1);
var soilMoisture =
    ee.ImageCollection(
    'NASA/FLDAS/NOAH01/C/GL/M/V001')
    .filterDate(
    '2024-01-01',
    '2024-12-31')
    .select('SoilMoi00_10cm_tavg')
    .mean();

var soilRisk =
    ee.Image(1)
    .where(soilMoisture.gt(0.35),5)
    .where(soilMoisture.gt(0.30)
    .and(soilMoisture.lte(0.35)),4)
    .where(soilMoisture.gt(0.25)
    .and(soilMoisture.lte(0.30)),3)
    .where(soilMoisture.gt(0.20)
    .and(soilMoisture.lte(0.25)),2)
    .where(soilMoisture.lte(0.20),1);
 var flowAcc =
    ee.Image(
    'WWF/HydroSHEDS/15ACC');

var flowRisk =
    ee.Image(1)
    .where(flowAcc.gt(10000),5)
    .where(flowAcc.gt(5000)
    .and(flowAcc.lte(10000)),4)
    .where(flowAcc.gt(1000)
    .and(flowAcc.lte(5000)),3)
    .where(flowAcc.gt(500)
    .and(flowAcc.lte(1000)),2)
    .where(flowAcc.lte(500),1);
var worldCover =
    ee.ImageCollection(
    'ESA/WorldCover/v200')
    .first();

var lulcRisk =
    ee.Image(1)

    .where(worldCover.eq(80),5)

    .where(worldCover.eq(50),4)

    .where(worldCover.eq(40),3)

    .where(worldCover.eq(10),2)

    .where(worldCover.eq(95),1);
 var slopeRad =
    slope.multiply(Math.PI)
    .divide(180);

var twi =
    flowAcc.add(1)
    .divide(
      slopeRad.tan()
      .add(0.001)
    )
    .log();

var twiRisk =
    ee.Image(1)
    .where(twi.gt(12),5)
    .where(twi.gt(10)
    .and(twi.lte(12)),4)
    .where(twi.gt(8)
    .and(twi.lte(10)),3)
    .where(twi.gt(6)
    .and(twi.lte(8)),2)
    .where(twi.lte(6),1);   

  // =====================================================
  // FLOOD INDEX
  // =====================================================

 var floodIndex =

elevationRisk.multiply(0.20)

.add(slopeRisk.multiply(0.15))

.add(rainRisk.multiply(0.15))

.add(riverRisk.multiply(0.15))

.add(flowRisk.multiply(0.10))

.add(lulcRisk.multiply(0.10))

.add(ndwiRisk.multiply(0.05))

.add(soilRisk.multiply(0.03))

.add(twiRisk.multiply(0.02))

.add(flowRisk.multiply(0.05));

  // =====================================================
  // CLASSIFICATION
  // =====================================================

  var floodClass =
      ee.Image(1)
      .where(floodIndex.gte(4),5)
      .where(
      floodIndex.gte(3.2)
      .and(floodIndex.lt(4)),4)
      .where(
      floodIndex.gte(2.4)
      .and(floodIndex.lt(3.2)),3)
      .where(
      floodIndex.gte(1.6)
      .and(floodIndex.lt(2.4)),2)
      .where(floodIndex.lt(1.6),1);
      // Save for other buttons

currentFloodClass = floodClass;

currentRegion = region;

currentDistrict = districtName;

// =====================================================
// TOTAL DISTRICT AREA
// =====================================================

var pixelArea = ee.Image.pixelArea()
                .divide(10000); // hectares

var totalArea = pixelArea.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: region,
  scale: 30,
  maxPixels: 1e13
}).getNumber('area');
// =====================================================
// FLOOD CLASS AREA STATISTICS
// =====================================================

var veryLowArea = pixelArea
  .updateMask(floodClass.eq(1))
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  }).getNumber('area');

var lowArea = pixelArea
  .updateMask(floodClass.eq(2))
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  }).getNumber('area');

var moderateArea = pixelArea
  .updateMask(floodClass.eq(3))
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  }).getNumber('area');

var highArea = pixelArea
  .updateMask(floodClass.eq(4))
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  }).getNumber('area');

var veryHighArea = pixelArea
  .updateMask(floodClass.eq(5))
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  }).getNumber('area');
  var veryLowPct =
    veryLowArea.divide(totalArea)
    .multiply(100);

var lowPct =
    lowArea.divide(totalArea)
    .multiply(100);

var moderatePct =
    moderateArea.divide(totalArea)
    .multiply(100);

var highPct =
    highArea.divide(totalArea)
    .multiply(100);

var veryHighPct =
    veryHighArea.divide(totalArea)
    .multiply(100);
  // =====================================================
  // DISPLAY
  // =====================================================

  Map.addLayer(
    floodClass.clip(region),
    {
      min:1,
      max:5,
      palette:[
         '#d6f0ff',
  '#92d4ff',
  '#4da6ff',
  '#0066cc',
  '#001f66'
      ]
    },
    'Flood Susceptibility'
  );

  Map.addLayer(
    selectedDistrict.style({
      color:'white',
      fillColor:'00000000',
      width:2
    }),
    {},
    'District Boundary'
  );
ee.Dictionary({

  totalArea: totalArea,

  veryLowArea: veryLowArea,
  lowArea: lowArea,
  moderateArea: moderateArea,
  highArea: highArea,
  veryHighArea: veryHighArea,

  veryLowPct: veryLowPct,
  lowPct: lowPct,
  moderatePct: moderatePct,
  highPct: highPct,
  veryHighPct: veryHighPct

}).evaluate(function(result){

  statsLabel.setValue(

    'FLOOD SUSCEPTIBILITY ANALYSIS\n\n' +

    'District: ' + districtName + '\n\n' +

    'TOTAL AREA\n' +
    result.totalArea.toFixed(2) +
    ' ha\n\n' +

    'AREA STATISTICS\n\n' +

    '🟢 Very Low : ' +
    result.veryLowArea.toFixed(2) +
    ' ha\n\n' +

    '🟡 Low : ' +
    result.lowArea.toFixed(2) +
    ' ha\n\n' +

    '🟠 Moderate : ' +
    result.moderateArea.toFixed(2) +
    ' ha\n\n' +

    '🔴 High : ' +
    result.highArea.toFixed(2) +
    ' ha\n\n' +

    '🟤 Very High : ' +
    result.veryHighArea.toFixed(2) +
    ' ha\n\n' +

    'PERCENTAGE AREA\n\n' +

    '🟢 Very Low : ' +
    result.veryLowPct.toFixed(2) +
    '%\n\n' +

    '🟡 Low : ' +
    result.lowPct.toFixed(2) +
    '%\n\n' +

    '🟠 Moderate : ' +
    result.moderatePct.toFixed(2) +
    '%\n\n' +

    '🔴 High : ' +
    result.highPct.toFixed(2) +
    '%\n\n' +

    '🟤 Very High : ' +
    result.veryHighPct.toFixed(2) +
    '%'
  );

});
  

  statsLabel.setValue(
  'Flood Susceptibility Analysis\n\n' +
  districtName + '\n\n' +
  'Factors Used:\n' +
  '1. Elevation\n' +
  '2. Slope\n' +
  '3. Rainfall\n' +
  '4. Distance to River\n' +
  '5. Flow Accumulation\n' +
  '6. Drainage Density\n' +
  '7. Land Use/Land Cover\n' +
  '8. NDWI\n' +
  '9. Soil Moisture\n' +
  '10. Topographic Wetness Index (TWI)'

  );
}
var fromYearSelect = ui.Select({
  items:['2019','2020','2021','2022','2023','2024','2025'],
  value:'2020',
  style:{stretch:'horizontal'}
});

var toYearSelect = ui.Select({
  items:['2019','2020','2021','2022','2023','2024','2025'],
  value:'2025',
  style:{stretch:'horizontal'}
});

function generateFloodChart(){

  if(currentFloodClass === null){
    statusLabel.setValue(
      'Generate Flood Map First'
    );
    return;
  }

  statusLabel.setValue(
    'Generating Flood Map...'
  );

  var areaImage = ee.Image.pixelArea()
      .divide(10000)
      .rename('area');

  var stats = areaImage.addBands(
      currentFloodClass.rename('class')
  ).reduceRegion({

      reducer: ee.Reducer.sum().group({
        groupField: 1,
        groupName: 'class'
      }),

      geometry: currentRegion,

      scale: 30,

      bestEffort: true,

      tileScale: 4,

      maxPixels: 1e13
  });

  stats.evaluate(function(result){

    if(!result || !result.groups){

      statusLabel.setValue(
        'Unable to calculate chart'
      );

      return;
    }

    var areaDict = {
      1:0,
      2:0,
      3:0,
      4:0,
      5:0
    };

    result.groups.forEach(function(item){
      areaDict[item.class] = item.sum;
    });

    var chartData = [
      ['Class','Area'],
      ['Very Low',areaDict[1]],
      ['Low',areaDict[2]],
      ['Moderate',areaDict[3]],
      ['High',areaDict[4]],
      ['Very High',areaDict[5]]
    ];

    var chart = ui.Chart(chartData)
      .setChartType('ColumnChart')
      .setOptions({

        title:'Flood Risk Distribution',

        legend:{position:'none'},

        hAxis:{
          title:'Risk Class'
        },

        vAxis:{
          title:'Area (ha)'
        }

      });

    if(chartPanel === null){

      chartPanel = ui.Panel({
        style:{
          width:'600px',
          height:'350px',
          position:'bottom-right',
          backgroundColor:'white'
        }
      });

      ui.root.add(chartPanel);

    } else {

      chartPanel.clear();
    }
var closeButton = ui.Button({
  label:'✖ Close',
  style:{
    color:'red',
    stretch:'horizontal'
  },
  onClick:function(){
    ui.root.remove(chartPanel);
    chartPanel = null;
  }
});

chartPanel.add(closeButton);
    chartPanel.add(chart);

    statusLabel.setValue(
      'Flood Statistics Completed'
    );

  });

}
function agricultureAtRisk(){

  if(currentFloodClass === null){

    statusLabel.setValue(
      'Generate Flood Map First'
    );

    return;
  }

  statusLabel.setValue(
    'Calculating Agriculture Exposure...'
  );

  // ====================================
  // ESA WORLDCOVER
  // ====================================

  var lulc = ee.ImageCollection(
      'ESA/WorldCover/v200')
      .first()
      .select('Map');

  // Cropland Class = 40

  var cropland =
      lulc.eq(40);

  // ====================================
  // HIGH + VERY HIGH FLOOD RISK
  // ====================================

  var floodRisk =
      currentFloodClass.gte(4);

  // ====================================
  // AGRICULTURE AT RISK
  // ====================================

  var agriRisk =
      cropland.and(floodRisk);

  // Display Layer

  Map.addLayer(
    agriRisk.selfMask(),
    {
      palette:['#FFD700']
    },
    'Agriculture At Risk'
  );

  // ====================================
  // AREA CALCULATION
  // ====================================

  var agriArea =
      ee.Image.pixelArea()
      .divide(10000)
      .rename('area')
      .updateMask(agriRisk)
      .reduceRegion({

        reducer: ee.Reducer.sum(),

        geometry: currentRegion,

        scale: 250,

        maxPixels: 1e13,

        bestEffort: true

      });

  agriArea.evaluate(function(result){

    var area = 0;

    if(result && result.area){

      area = result.area;

    }

    statsLabel.setValue(

      '🌾 AGRICULTURE EXPOSURE ANALYSIS\n\n' +

      'District: ' +
      currentDistrict +

      '\n\n' +

      'Cropland in High & Very High Flood Risk Zones:\n\n' +

      Number(area)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +

      ' hectares'

    );

    statusLabel.setValue(
      'Agriculture Analysis Complete'
    );

  });

}
function populationAtRisk(){

  if(currentFloodClass === null){

    statusLabel.setValue(
      'Generate Flood Map First'
    );

    return;
  }

  statusLabel.setValue(
    'Calculating Population Exposure...'
  );

  // =====================================
  // WORLDPOP INDIA
  // =====================================

  var population = ee.ImageCollection(
      'WorldPop/GP/100m/pop')
      .filter(ee.Filter.eq('country','IND'))
      .first();

  print('Population Image', population);

  // =====================================
  // TOTAL POPULATION
  // =====================================

  var totalPop = population.reduceRegion({

    reducer: ee.Reducer.sum(),

    geometry: currentRegion,

    scale: 100,

    maxPixels: 1e13

  });

  // =====================================
  // HIGH RISK POPULATION
  // =====================================

  var highRiskPop = population
      .updateMask(currentFloodClass.eq(4))
      .reduceRegion({

        reducer: ee.Reducer.sum(),

        geometry: currentRegion,

        scale: 100,

        maxPixels: 1e13

      });

  // =====================================
  // VERY HIGH RISK POPULATION
  // =====================================

  var veryHighRiskPop = population
      .updateMask(currentFloodClass.eq(5))
      .reduceRegion({

        reducer: ee.Reducer.sum(),

        geometry: currentRegion,

        scale: 100,

        maxPixels: 1e13

      });

  // =====================================
  // GET VALUES SAFELY
  // =====================================

  totalPop.evaluate(function(totalResult){

    highRiskPop.evaluate(function(highResult){

      veryHighRiskPop.evaluate(function(vHighResult){

        var totalPopulation = 0;
        var highPopulation = 0;
        var veryHighPopulation = 0;

        if(totalResult){

          var keys = Object.keys(totalResult);

          if(keys.length > 0){
            totalPopulation =
              Number(totalResult[keys[0]] || 0);
          }
        }

        if(highResult){

          var keys = Object.keys(highResult);

          if(keys.length > 0){
            highPopulation =
              Number(highResult[keys[0]] || 0);
          }
        }

        if(vHighResult){

          var keys = Object.keys(vHighResult);

          if(keys.length > 0){
            veryHighPopulation =
              Number(vHighResult[keys[0]] || 0);
          }
        }

        var exposedPopulation =
            highPopulation +
            veryHighPopulation;

        var exposurePercent = 0;

        if(totalPopulation > 0){

          exposurePercent =
              (exposedPopulation /
               totalPopulation) * 100;
        }

        statsLabel.setValue(

          '👥 POPULATION EXPOSURE ANALYSIS\n\n' +

          'District: ' +
          currentDistrict +

          '\n\n' +

          'Total Population:\n' +
          totalPopulation.toFixed(0)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +

          '\n\n' +

          'High Risk Population:\n' +
          highPopulation.toFixed(0)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +

          '\n\n' +

          'Very High Risk Population:\n' +
          veryHighPopulation.toFixed(0)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +

          '\n\n' +

          'Total Exposed Population:\n' +
          exposedPopulation.toFixed(0)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +

          '\n\n' +

          'Exposure Percentage:\n' +
          exposurePercent.toFixed(2) +
          ' %'

        );

        statusLabel.setValue(
          'Population Analysis Complete'
        );

      });

    });

  });

  // =====================================
  // POPULATION EXPOSURE MAP
  // =====================================

  Map.addLayer(

    population.updateMask(
      currentFloodClass.gte(4)
    ),

    {
      min:0,
      max:500,
      palette:[
        '#ffffcc',
        '#ffeda0',
        '#feb24c',
        '#fd8d3c',
        '#f03b20',
        '#bd0026'
      ]
    },

    'Population Exposure'

  );

}
function downloadFloodMap(){

  if(currentFloodClass === null){
    statusLabel.setValue(
      'Generate Flood Map First'
    );
    return;
  }

  Export.image.toDrive({

    image: currentFloodClass,

    description:
      'FloodRisk_' +
      currentDistrict,

    folder:'GEE_Flood',

    region: currentRegion,

    scale:30,

    maxPixels:1e13

  });

  statusLabel.setValue(
    'Export task created. Check Tasks tab.'
  );

}

// ============================================================================
// BUTTONS
// ============================================================================

var runButton = ui.Button({

  label: 'Generate Index',

  style: {

    stretch: 'horizontal',

    backgroundColor: '#1b5e20',

    color: 'red',

    fontWeight: 'bold',

    padding: '10px'

  }

});


var timeSeriesButton = ui.Button({

  label: 'Time Series',

  style: {

    stretch: 'horizontal',

    backgroundColor: '#6a1b9a',

    color: 'red',

    fontWeight: 'bold',

    padding: '10px'

  }

});

var downloadButton = ui.Button({

  label: 'Download Map',

  style: {

    stretch: 'horizontal',

    backgroundColor: '#1565c0',

    color: 'red',

    fontWeight: 'bold',

    padding: '10px'

  }

});


var resetButton = ui.Button({

  label: 'Reset Map',

  style: {

    stretch: 'horizontal',

    backgroundColor: '#c62828',

    color: 'red',

    fontWeight: 'bold',

    padding: '10px'

  }

});

var waterlogHybridButton = ui.Button({
  label:'Generate Waterlooging Status Map',
  style:{
    stretch:'horizontal',
    backgroundColor:'#1565c0',
    color:'red',
    fontWeight:'bold'
  }
});
var waterInfoButton = ui.Button({
  label:'ℹ Waterlogging Methodology',
  style:{
    stretch:'horizontal',
    backgroundColor:'#00897b',
    color:'blue',
    fontWeight:'bold'
  }
});

var downloadWaterButton = ui.Button({
  label: '⬇ Download Waterlogging Map',
  style: {
    stretch: 'horizontal',
    backgroundColor: '#2e7d32',
    color: 'red',
    fontWeight: 'bold'
  }
});
var floodButton = ui.Button({
  label:'Generate Flood Hazard',
  style:{
    stretch:'horizontal',
    backgroundColor:'#1565c0',
    color:'red',
    fontWeight:'bold'
  }
});
var floodChartButton = ui.Button('📈 Flood Risk Chart');
var agricultureButton = ui.Button('🌾 Agriculture at Risk');
var populationButton = ui.Button('👥 Population at Risk');
var downloadFloodButton = ui.Button('⬇ Download Flood Map');
var changeButton = ui.Button({
  label:'Change Detection',
  style:{
    stretch:'horizontal',
    backgroundColor:'#ff6f00',
    color:'red',
    fontWeight:'bold'
  }
});
var trendButton = ui.Button({

  label:'Multi-Year Trend',

  style:{
    stretch:'horizontal',
    backgroundColor:'#00897b',
    color:'red',
    fontWeight:'bold',
    padding:'10px'
  }

});
var animationButton = ui.Button({

  label:'Generate GIF',

  style:{
    stretch:'horizontal',
    backgroundColor:'#5e35b1',
    color:'red',
    fontWeight:'bold',
    padding:'10px'
  }

});

// ============================================================================
// STATUS LABELS
// ============================================================================

var statusLabel = ui.Label({

  value: 'Ready',

  style: {

    color: 'blue',

    fontWeight: 'bold'

  }

});


var statsLabel = ui.Label({

  value: '',

  style: {

    whiteSpace: 'pre',

    fontSize: '12px'

  }

});

//===================================
// GIF LINK LABEL
//===================================

var gifLinkLabel = ui.Label({
  value: '',
  style: {
    color: 'blue',
    fontWeight: 'bold',
    textDecoration: 'underline',
    fontSize: '12px'
  }
});

var indexPanel = ui.Panel();

indexPanel.add(ui.Label('Select Index'));
indexPanel.add(indexSelect);

indexPanel.add(ui.Label('Cloud Percentage'));
indexPanel.add(cloudSlider);

indexPanel.add(runButton);
indexPanel.add(timeSeriesButton);

indexPanel.add(trendButton);
indexPanel.add(animationButton);
indexPanel.add(gifLinkLabel);

indexPanel.add(downloadButton);

indexPanel.add(ui.Label('From Year'));
indexPanel.add(fromYearSelect);

indexPanel.add(ui.Label('To Year'));
indexPanel.add(toYearSelect);

indexPanel.add(changeButton);


var waterPanel = ui.Panel();
waterPanel.clear();
waterPanel.add(waterlogHybridButton);
waterPanel.add(waterInfoButton);
waterPanel.add(downloadWaterButton);
waterPanel.add(downloadLinkLabel);
// ============================================================================
// MAIN PANEL
// ============================================================================

var panel = ui.Panel({
  style:{
    width:'360px',
    padding:'10px',
    backgroundColor:'#f7f9fc',
    border:'1px solid #d9d9d9'
  }
});
var floodPanel = ui.Panel();

floodPanel.add(
  ui.Label('Flood Susceptibility Mapping')
);

floodPanel.add(floodButton);

floodPanel.add(floodChartButton);
floodPanel.add(agricultureButton);
floodPanel.add(populationButton);
floodPanel.add(downloadFloodButton);
var chartPanel = ui.Panel({
  style:{
    stretch:'horizontal',
    margin:'10px 0px 0px 0px'
  }
});

floodPanel.add(chartPanel);
panel.add(headerPanel);
panel.add(infoButton);

// Module Selection
panel.add(ui.Label({
  value:'Study Modules',
  style:{
    fontWeight:'bold',
    fontSize:'14px'
  }
}));

panel.add(moduleBar);

// Common Controls
panel.add(ui.Label('Select District'));
panel.add(districtSelect);

panel.add(ui.Label('Select Year'));
panel.add(yearSelect);

panel.add(ui.Label('Select Month'));
panel.add(monthSelect);

// Dynamic Panels
panel.add(indexPanel);
panel.add(waterPanel);

panel.add(floodPanel);
// Common Controls
panel.add(resetButton);

panel.add(statusLabel);
panel.add(statsLabel);


// Add panel to UI
ui.root.insert(0, panel);

waterPanel.style().set('shown', false);

floodPanel.style().set('shown', false);




// ============================================================================
// LEGEND PANEL
// ============================================================================

var legend = ui.Panel({

  style: {

    position: 'bottom-left',

    padding: '10px',

    backgroundColor: 'white'

  }

});

Map.add(legend);

// ============================================================================
// UPDATE LEGEND
// ============================================================================

function updateLegend(indexName) {

  legend.clear();

  var palette = visParams[indexName].palette;

  var names = legendInfo[indexName].names;

  legend.add(ui.Label({

    value: indexName + ' Legend',

    style: {

      fontWeight: 'bold',

      fontSize: '14px',

      margin: '0 0 6px 0'

    }

  }));

  for (var i = 0; i < palette.length; i++) {

    var colorBox = ui.Label('', {

      backgroundColor: palette[i],

      padding: '8px',

      margin: '0 4px 4px 0'

    });

    var description = ui.Label(names[i]);

    var row = ui.Panel({

      widgets: [colorBox, description],

      layout: ui.Panel.Layout.Flow('horizontal')

    });

    legend.add(row);
  }
}


// ============================================================================
// INITIAL MAP
// ============================================================================

Map.setOptions('SATELLITE');

Map.centerObject(districts, 7);

updateLegend('NDVI');


// ============================================================================
// GENERATE INDEX FUNCTION
// ============================================================================

function generateIndex() {

  statusLabel.setValue('Processing...');

  statsLabel.setValue('');

  Map.clear();

  Map.add(legend);

  var districtName = districtSelect.getValue();

  var year = yearSelect.getValue();

  var month = monthSelect.getValue();

  var selectedIndex = indexSelect.getValue();

  updateLegend(selectedIndex);

  var selectedDistrict = districts.filter(

    ee.Filter.eq('ADM2_NAME', districtName)

  );

  var region = selectedDistrict.geometry();

  currentRegion = region;

  Map.centerObject(region, 9);

  var startDate = ee.Date(year + '-' + month + '-01');

  var endDate = startDate.advance(1, 'month');

  var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')

    .filterDate(startDate, endDate)

    .filterBounds(region)

    .filter(ee.Filter.lt(
      'CLOUDY_PIXEL_PERCENTAGE',
      cloudSlider.getValue()
    ))

    .map(maskS2clouds);

  s2.size().evaluate(function(count) {

    if (count === 0) {

      statusLabel.setValue('No Data Found');

      return;
    }

    var composite = s2.median().clip(region);
currentComposite = composite;
    var indexImage;

    if (selectedIndex === 'NDVI') {

      indexImage = composite.normalizedDifference(['B8', 'B4']);

    }

    else if (selectedIndex === 'EVI') {

      indexImage = composite.expression(

        '2.5*((NIR-RED)/(NIR+6*RED-7.5*BLUE+1))',

        {

          NIR: composite.select('B8'),

          RED: composite.select('B4'),

          BLUE: composite.select('B2')

        }

      );

    }

    else if (selectedIndex === 'SAVI') {

      indexImage = composite.expression(

        '((NIR-RED)/(NIR+RED+0.5))*1.5',

        {

          NIR: composite.select('B8'),

          RED: composite.select('B4')

        }

      );

    }

    else if (selectedIndex === 'NDWI') {

      indexImage = composite.normalizedDifference(['B3', 'B8']);

    }

    else if (selectedIndex === 'GNDVI') {

      indexImage = composite.normalizedDifference(['B8', 'B3']);

    }

    else if (selectedIndex === 'NDBI') {

      indexImage = composite.normalizedDifference(['B11', 'B8']);

    }

    else if (selectedIndex === 'NDMI') {

      indexImage = composite.normalizedDifference(['B8', 'B11']);

    }

    indexImage = indexImage.rename(selectedIndex);
currentIndexImage = indexImage;
   

    Map.addLayer(composite, rgbVis, 'RGB');
    

    Map.addLayer(

      indexImage,

      visParams[selectedIndex],

      selectedIndex

    );
    
    

    Map.addLayer(

      selectedDistrict.style({

        color: 'white',

        fillColor: '00000000',

        width: 2

      }),

      {},

      'District Boundary'

    );

    var stats = indexImage.reduceRegion({

      reducer: ee.Reducer.mean()

        .combine({

          reducer2: ee.Reducer.min(),

          sharedInputs: true

        })

        .combine({

          reducer2: ee.Reducer.max(),

          sharedInputs: true

        })

        .combine({

          reducer2: ee.Reducer.stdDev(),

          sharedInputs: true

        }),

      geometry: region,

      scale: 1000,

      bestEffort: true,

      maxPixels: 1e10

    });

    stats.evaluate(function(result) {

      statsLabel.setValue(

        'DISTRICT: ' + districtName + '\n\n' +

        'INDEX: ' + selectedIndex + '\n\n' +

        'YEAR: ' + year + '\n' +

        'MONTH: ' + month + '\n\n' +

        'IMAGES USED: ' + count + '\n\n' +

        'MEAN: ' +
        Number(result[selectedIndex + '_mean']).toFixed(3) + '\n' +

        'MIN: ' +
        Number(result[selectedIndex + '_min']).toFixed(3) + '\n' +

        'MAX: ' +
        Number(result[selectedIndex + '_max']).toFixed(3) + '\n' +

        'STD DEV: ' +
        Number(result[selectedIndex + '_stdDev']).toFixed(3)

      );

      statusLabel.setValue('Completed');

    });

  });

}

if(chartPanel !== null){
  ui.root.remove(chartPanel);
  chartPanel = null;
}


// ============================================================================
// TIME SERIES FUNCTION
// ============================================================================

function generateTimeSeries() {

  var districtName = districtSelect.getValue();

  var selectedIndex = indexSelect.getValue();

  var selectedDistrict = districts.filter(

    ee.Filter.eq('ADM2_NAME', districtName)

  );

  var region = selectedDistrict.geometry();

  var collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')

    .filterDate('2024-01-01', '2025-12-31')

    .filterBounds(region)

    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 60))

    .map(maskS2clouds)

    .map(function(img) {

      var indexImage;

      if (selectedIndex === 'NDVI') {

        indexImage = img.normalizedDifference(['B8', 'B4']);

      }

      else if (selectedIndex === 'NDWI') {

        indexImage = img.normalizedDifference(['B3', 'B8']);

      }

      else {

        indexImage = img.normalizedDifference(['B8', 'B4']);

      }

      return indexImage.rename(selectedIndex)

        .copyProperties(img, ['system:time_start']);

    });

  var chart = ui.Chart.image.series({

    imageCollection: collection,

    region: region,

    reducer: ee.Reducer.mean(),

    scale: 1000

  })

  .setOptions({

    title: selectedIndex + ' Time Series',

    lineWidth: 2,

    pointSize: 3,

    vAxis: {

      title: selectedIndex

    },

    hAxis: {

      title: 'Date'

    }

  });

  chartPanel = ui.Panel({

  style: {

    width: '650px',

    height: '320px',

    position: 'bottom-right',

    backgroundColor: 'white'

  }

});

// Close Button
var closeButton = ui.Button({
  label: '✖ Close',
  style: {
    stretch: 'horizontal',
    color: 'red'
  },
  onClick: function() {
    ui.root.remove(chartPanel);
    chartPanel = null;
  }
});

chartPanel.add(closeButton);
chartPanel.add(chart);

ui.root.add(chartPanel);

  statusLabel.setValue('Time Series Ready');
}
if(chartPanel !== null){
  ui.root.remove(chartPanel);
  chartPanel = null;
}
//multiyeartrend
function generateMultiYearTrend(){

  var districtName = districtSelect.getValue();

  var selectedIndex = indexSelect.getValue();

  var selectedDistrict = districts.filter(
      ee.Filter.eq(
      'ADM2_NAME',
      districtName));

  var region = selectedDistrict.geometry();

  var years = ee.List.sequence(2019,2025);

  var annualCollection =
      ee.ImageCollection.fromImages(

      years.map(function(y){

        var start =
            ee.Date.fromYMD(y,1,1);

        var end =
            start.advance(1,'year');

        var s2 =
            ee.ImageCollection(
            'COPERNICUS/S2_SR_HARMONIZED')

            .filterDate(start,end)

            .filterBounds(region)

            .filter(
            ee.Filter.lt(
            'CLOUDY_PIXEL_PERCENTAGE',
            30))

            .map(maskS2clouds)

            .median();

        var indexImage;

        if(selectedIndex=='NDVI'){
          indexImage=
          s2.normalizedDifference(
          ['B8','B4']);
        }

        else if(selectedIndex=='NDWI'){
          indexImage=
          s2.normalizedDifference(
          ['B3','B8']);
        }

        else if(selectedIndex=='GNDVI'){
          indexImage=
          s2.normalizedDifference(
          ['B8','B3']);
        }

        else if(selectedIndex=='NDBI'){
          indexImage=
          s2.normalizedDifference(
          ['B11','B8']);
        }

        else if(selectedIndex=='NDMI'){
          indexImage=
          s2.normalizedDifference(
          ['B8','B11']);
        }

        else if(selectedIndex=='SAVI'){
          indexImage=
          s2.expression(
          '((NIR-RED)/(NIR+RED+0.5))*1.5',
          {
            NIR:s2.select('B8'),
            RED:s2.select('B4')
          });
        }

        else{

          indexImage=
          s2.expression(
          '2.5*((NIR-RED)/(NIR+6*RED-7.5*BLUE+1))',
          {
            NIR:s2.select('B8'),
            RED:s2.select('B4'),
            BLUE:s2.select('B2')
          });

        }
currentIndexImage = indexImage;
        return indexImage
        .rename(selectedIndex)
        .set(
        'system:time_start',
        start.millis());

      })

  );

  var chart =
      ui.Chart.image.series({

      imageCollection:
      annualCollection,

      region:region,

      reducer:
      ee.Reducer.mean(),

      scale:1000

      })

      .setOptions({

      title:
      selectedIndex +
      ' Multi-Year Trend',

      hAxis:{
        title:'Year'
      },

      vAxis:{
        title:selectedIndex
      },

      lineWidth:4,

      pointSize:7

      });

  if(chartPanel!==null){
    ui.root.remove(chartPanel);
  }

 chartPanel = ui.Panel({
  style:{
    width:'700px',
    height:'350px',
    position:'bottom-right',
    backgroundColor:'white'
  }
});

var closeTrendButton = ui.Button({
  label:'✖ Close',
  style:{
    color:'red',
    stretch:'horizontal'
  },
  onClick:function(){
    ui.root.remove(chartPanel);
    chartPanel = null;
  }
});

chartPanel.add(closeTrendButton);
chartPanel.add(chart);

ui.root.add(chartPanel);

  statusLabel.setValue(
  'Multi-Year Trend Ready');

}
//======================================================
// ANIMATED GIF FOR ALL INDICES
//======================================================

function generateIndexGIF() {

  statusLabel.setValue('Generating GIF...');

  var districtName = districtSelect.getValue();
  var year = parseInt(yearSelect.getValue());
  var selectedIndex = indexSelect.getValue();

  var selectedDistrict = districts.filter(
    ee.Filter.eq('ADM2_NAME', districtName)
  );

  var region = selectedDistrict.geometry();

  var months = ee.List.sequence(1, 12);

  var frames = ee.ImageCollection.fromImages(

    months.map(function(m) {

      var start = ee.Date.fromYMD(year, m, 1);
      var end = start.advance(1, 'month');

      var collection = ee.ImageCollection(
          'COPERNICUS/S2_SR_HARMONIZED')
          .filterBounds(region)
          .filterDate(start, end)
          .filter(
            ee.Filter.lt(
              'CLOUDY_PIXEL_PERCENTAGE',
              80
            )
          )
          .map(maskS2clouds);

      // If no images exist, return a blank RGB image
      return ee.Image(
        ee.Algorithms.If(

          collection.size().gt(0),

          (function() {

            var image = collection.median().clip(region);

            var indexImage;

            if (selectedIndex === 'NDVI') {
              indexImage =
                image.normalizedDifference(['B8', 'B4']);
            }

            else if (selectedIndex === 'EVI') {
              indexImage = image.expression(
                '2.5*((NIR-RED)/(NIR+6*RED-7.5*BLUE+1))',
                {
                  NIR: image.select('B8'),
                  RED: image.select('B4'),
                  BLUE: image.select('B2')
                }
              );
            }

            else if (selectedIndex === 'SAVI') {
              indexImage = image.expression(
                '((NIR-RED)/(NIR+RED+0.5))*1.5',
                {
                  NIR: image.select('B8'),
                  RED: image.select('B4')
                }
              );
            }

            else if (selectedIndex === 'NDWI') {
              indexImage =
                image.normalizedDifference(['B3', 'B8']);
            }

            else if (selectedIndex === 'GNDVI') {
              indexImage =
                image.normalizedDifference(['B8', 'B3']);
            }

            else if (selectedIndex === 'NDBI') {
              indexImage =
                image.normalizedDifference(['B11', 'B8']);
            }

            else if (selectedIndex === 'NDMI') {
              indexImage =
                image.normalizedDifference(['B8', 'B11']);
            }

            return indexImage
              .visualize({
                min: visParams[selectedIndex].min,
                max: visParams[selectedIndex].max,
                palette: visParams[selectedIndex].palette
              })
              .clip(region)
              .set(
                'system:time_start',
                start.millis()
              );

          })(),

          // Blank RGB image (3 bands)
          ee.Image.constant([255,255,255])
            .rename(['vis-red','vis-green','vis-blue'])
            .toByte()
            .clip(region)
            .set(
              'system:time_start',
              start.millis()
            )

        )
      );

    })

  );

  print('Frames:', frames.size());

  var gifArgs = {
    region: region,
    dimensions: 700,
    crs: 'EPSG:4326',
    framesPerSecond: 2
  };

  var gifURL = frames.getVideoThumbURL(gifArgs);

  gifLinkLabel.setValue(
  'Open ' + selectedIndex + ' Animation GIF'
);

gifLinkLabel.setUrl(gifURL);

statusLabel.setValue(
  'GIF Generated Successfully'
);

}
//change detection
function generateChangeDetection(){

  statusLabel.setValue('Generating Change Detection...');

  Map.clear();
  Map.add(legend);

  var districtName = districtSelect.getValue();

  var selectedDistrict = districts.filter(
    ee.Filter.eq('ADM2_NAME', districtName)
  );

  var region = selectedDistrict.geometry();

  var fromYear = fromYearSelect.getValue();
  var toYear = toYearSelect.getValue();

  var selectedIndex = indexSelect.getValue();

  var start1 = ee.Date(fromYear + '-01-01');
  var end1 = ee.Date(fromYear + '-12-31');

  var start2 = ee.Date(toYear + '-01-01');
  var end2 = ee.Date(toYear + '-12-31');

  var img1 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(region)
      .filterDate(start1,end1)
      .filter(ee.Filter.lt(
        'CLOUDY_PIXEL_PERCENTAGE',30))
      .map(maskS2clouds)
      .median()
      .clip(region);

  var img2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(region)
      .filterDate(start2,end2)
      .filter(ee.Filter.lt(
        'CLOUDY_PIXEL_PERCENTAGE',30))
      .map(maskS2clouds)
      .median()
      .clip(region);

  var index1;
  var index2;

  if(selectedIndex === 'NDVI'){
    index1 = img1.normalizedDifference(['B8','B4']);
    index2 = img2.normalizedDifference(['B8','B4']);
  }

  else if(selectedIndex === 'NDWI'){
    index1 = img1.normalizedDifference(['B3','B8']);
    index2 = img2.normalizedDifference(['B3','B8']);
  }

  else if(selectedIndex === 'GNDVI'){
    index1 = img1.normalizedDifference(['B8','B3']);
    index2 = img2.normalizedDifference(['B8','B3']);
  }

  else if(selectedIndex === 'NDBI'){
    index1 = img1.normalizedDifference(['B11','B8']);
    index2 = img2.normalizedDifference(['B11','B8']);
  }

  else if(selectedIndex === 'NDMI'){
    index1 = img1.normalizedDifference(['B8','B11']);
    index2 = img2.normalizedDifference(['B8','B11']);
  }

  else{
    index1 = img1.normalizedDifference(['B8','B4']);
    index2 = img2.normalizedDifference(['B8','B4']);
  }

  var change = index2.subtract(index1);

  var changeVis = {
    min:-0.4,
    max:0.4,
    palette:[
      '#d73027',
      '#ffffbf',
      '#1a9850'
    ]
  };
legend.clear();

legend.add(ui.Label({
  value:'Change Detection',
  style:{
    fontWeight:'bold'
  }
}));

var colors = [
  '#d73027',
  '#ffffbf',
  '#1a9850'
];

var labels = [
  'Decrease',
  'No Change',
  'Increase'
];

for(var i=0;i<3;i++){

  legend.add(
    ui.Panel([
      ui.Label('',{
        backgroundColor:colors[i],
        padding:'8px'
      }),
      ui.Label(labels[i])
    ],
    ui.Panel.Layout.Flow('horizontal'))
  );
}
  Map.addLayer(
    change,
    changeVis,
    selectedIndex + ' Change'
  );

  Map.addLayer(
    selectedDistrict.style({
      color:'white',
      fillColor:'00000000',
      width:2
    }),
    {},
    'District Boundary'
  );

  statsLabel.setValue(
    'CHANGE DETECTION\n\n' +
    districtName + '\n\n' +
    selectedIndex + '\n\n' +
    fromYear + ' → ' + toYear + '\n\n' +
    'Green = Increase\n' +
    'Red = Decrease'
  );

  statusLabel.setValue('Change Detection Ready');
}

// ============================================================================
// DOWNLOAD FUNCTION
// ============================================================================


function downloadIndexMap(){

  if(currentIndexImage === null){

    statusLabel.setValue(
      'Generate Index First'
    );

    return;
  }

  Export.image.toDrive({

    image: currentIndexImage,

    description:
      indexSelect.getValue() + '_Export',

    fileNamePrefix:
      indexSelect.getValue() + '_' +
      districtSelect.getValue(),

    region: currentRegion,

    scale: 30,

    maxPixels: 1e13

  });

  statusLabel.setValue(
    'Export Task Created - Check Tasks Tab'
  );


}
// ============================================================================
// RESET FUNCTION
// ============================================================================

function resetMap() {

  Map.clear();

  Map.add(legend);

  Map.centerObject(districts, 7);

  Map.setOptions('SATELLITE');

  statsLabel.setValue('');

  updateLegend('NDVI');

  if (chartPanel !== null) {

    ui.root.remove(chartPanel);

  }
inspectorActive = false;

inspectorLabel.setValue(
'Click on map to inspect pixel'
);
  statusLabel.setValue('Reset Complete');
}


// ============================================================================
// BUTTON EVENTS
// ============================================================================
infoButton.onClick(function(){

  infoPanel.style().set(
    'shown',
    true
  );

});
closeInfoButton.onClick(function(){

  infoPanel.style().set(
    'shown',
    false
  );

});
indexModuleBtn.onClick(function(){
  showModule('index');
});

waterModuleBtn.onClick(function(){
  showModule('water');
});

floodModuleBtn.onClick(function(){
  showModule('flood');
});
runButton.onClick(generateIndex);
changeButton.onClick(
  generateChangeDetection
);

timeSeriesButton.onClick(generateTimeSeries);
trendButton.onClick(
generateMultiYearTrend
);

downloadButton.onClick(
  downloadIndexMap
);
animationButton.onClick(
generateIndexGIF
);
resetButton.onClick(resetMap);

waterlogHybridButton.onClick(
generateWaterloggingMNDWI
);
waterInfoButton.onClick(function(){

  waterInfoPanel.style().set(
    'shown',
    true
  );

});
floodButton.onClick(
  generateFloodSusceptibility
);
floodChartButton.onClick(generateFloodChart);
agricultureButton.onClick(
  agricultureAtRisk
);
populationButton.onClick(
  populationAtRisk
);
downloadFloodButton.onClick(
  downloadFloodMap
);
downloadWaterButton.onClick(function(){

  if(currentWaterloggingMap === null){
    statusLabel.setValue(
      'Please generate a waterlogging map first.'
    );
    return;
  }

  statusLabel.setValue(
    'Generating download link...'
  );

  var districtName =
      districtSelect.getValue();

  var selectedDistrict =
      districts.filter(
      ee.Filter.eq(
      'ADM2_NAME',
      districtName));

  var region =
      selectedDistrict.geometry();

  var url =
      currentWaterloggingMap
      .toInt()
      .getDownloadURL({

      name:
      'Waterlogging_' +
      districtName,

      region:
      region,

      scale:
      50,

      crs:
      'EPSG:4326',

      format:
      'GEO_TIFF'

  });

  print('Download URL:', url);

 downloadLinkLabel.setUrl(url);

downloadLinkLabel.setValue(
  '⬇ Download GeoTIFF'
);
statusLabel.setValue(
  'Download link ready.'
);

});
// ============================================================================
// INITIAL RUN
// ============================================================================

generateIndex();
showModule('index');