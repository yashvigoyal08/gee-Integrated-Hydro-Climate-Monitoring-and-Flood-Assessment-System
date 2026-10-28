# 🌎 IEMFAS: Integrated Environmental Monitoring and Flood Assessment System for Odisha

> A cloud-based Remote Sensing & GIS decision-support web app built on **Google Earth Engine** for vegetation monitoring, waterlogging mapping and flood susceptibility assessment across all 30 districts of Odisha, India.

![Google Earth Engine](https://img.shields.io/badge/Platform-Google%20Earth%20Engine-4285F4)
![Language](https://img.shields.io/badge/Language-JavaScript-F7DF1E)
![Sensors](https://img.shields.io/badge/Data-Sentinel--1%20%7C%20Sentinel--2-green)
![Status](https://img.shields.io/badge/Status-Research%20Prototype-orange)

---

## 📌 Overview

Odisha is among India's most flood-prone states, facing recurrent riverine floods, cyclone-driven inundation and seasonal waterlogging. IEMFAS brings multi-sensor satellite data, terrain, rainfall, hydrology and socio-economic layers into **one interactive dashboard**. Planners, researchers and disaster-management agencies can analyse any district in a few clicks, with no software installation and no local data downloads.

## 🎯 Objectives

1. Build an interactive, district-level monitoring platform for Odisha on Google Earth Engine.
2. Monitor vegetation, moisture and water conditions using seven Sentinel-2 spectral indices.
3. Map **waterlogged areas** by fusing optical (Sentinel-2) and radar (Sentinel-1 SAR) data with terrain constraints.
4. Produce a **flood susceptibility map** using a multi-criteria, weighted-overlay approach.
5. Quantify **exposure of population and agricultural land** in high-risk zones.
6. Support change detection, multi-year trend analysis and animated time-lapses.
7. Provide area statistics, charts and exports (GeoTIFF / Google Drive) for downstream analysis.

## ✨ Key Features

| Module | Capabilities |
|---|---|
| 🌿 **Indices** | NDVI, EVI, SAVI, GNDVI, NDWI, NDBI, NDMI; district statistics (mean/min/max/SD); time series; multi-year trend (2019–2025); change detection; animated GIF; map export |
| 💧 **Waterlogging** | Hybrid optical + SAR classification into 4 classes; area statistics in hectares; methodology panel; GeoTIFF download link |
| 🌊 **Flood Hazard** | 5-class susceptibility map; area and percentage statistics; risk chart; agriculture-at-risk and population-at-risk analysis; export to Drive |

## 🛰️ Datasets Used

| Dataset | Earth Engine ID | Purpose |
|---|---|---|
| Sentinel-2 MSI SR (Harmonized) | `COPERNICUS/S2_SR_HARMONIZED` | Spectral indices, MNDWI, NDMI, NDVI, NDWI |
| Sentinel-1 SAR GRD (VV, VH) | `COPERNICUS/S1_GRD` | Surface water and paddy detection |
| SRTM DEM (30 m) | `USGS/SRTMGL1_003` | Elevation and slope |
| CHIRPS Daily Rainfall | `UCSB-CHG/CHIRPS/DAILY` | Annual rainfall |
| JRC Global Surface Water | `JRC/GSW1_4/GlobalSurfaceWater` | Distance to rivers/water bodies |
| NASA FLDAS Noah | `NASA/FLDAS/NOAH01/C/GL/M/V001` | Soil moisture (0–10 cm) |
| HydroSHEDS Flow Accumulation | `WWF/HydroSHEDS/15ACC` | Flow accumulation and TWI |
| ESA WorldCover v200 | `ESA/WorldCover/v200` | Land use/land cover, cropland mask |
| WorldPop (100 m) | `WorldPop/GP/100m/pop` | Population exposure |
| FAO GAUL 2015 (Level 2) | `FAO/GAUL/2015/level2` | District boundaries |

## 🔬 Methodology

### 1. Pre-processing
- Cloud and cirrus masking using the Sentinel-2 `QA60` band
- Reflectance scaling (÷10000) and monthly/annual median compositing
- Sentinel-1 IW mode, VV + VH monthly median composite

### 2. Spectral Indices

| Index | Formula |
|---|---|
| NDVI | (NIR − Red) / (NIR + Red) |
| EVI | 2.5 × (NIR − Red) / (NIR + 6·Red − 7.5·Blue + 1) |
| SAVI | 1.5 × (NIR − Red) / (NIR + Red + 0.5) |
| NDWI | (Green − NIR) / (Green + NIR) |
| GNDVI | (NIR − Green) / (NIR + Green) |
| NDBI | (SWIR1 − NIR) / (SWIR1 + NIR) |
| NDMI | (NIR − SWIR1) / (NIR + SWIR1) |

### 3. Hybrid Waterlogging Mapping

A rule-based fusion of optical indices, SAR backscatter and slope:

| Class | Conditions |
|---|---|
| **Permanent Water** | MNDWI > 0.10, VV < −14 dB, VH < −20 dB, NDVI < 0.30 |
| **Seasonal Waterlogging** | MNDWI > −0.05, NDMI > 0.15, VV < −11 dB, VH < −17 dB, NDVI < 0.55, slope < 5° |
| **Paddy / Moist Soil** | 0.35 < NDVI < 0.85, NDMI > 0.10, VH < −16 dB, slope < 3° |
| **Non-Waterlogged** | All remaining pixels |

A focal-mode (majority) filter removes salt-and-pepper noise. Area statistics are computed in hectares at 10 m.

> NDVI separates actively growing paddy (high vegetation) from true waterlogged land (low vegetation).

### 4. Flood Susceptibility (Weighted Overlay)

Each factor is reclassified on a 1 (very low) to 5 (very high) scale and combined linearly:

| Factor | Weight |
|---|---|
| Elevation | 0.20 |
| Slope | 0.15 |
| Rainfall (annual) | 0.15 |
| Distance to river | 0.15 |
| Flow accumulation | 0.15 |
| Land use / land cover | 0.10 |
| NDWI | 0.05 |
| Soil moisture | 0.03 |
| Topographic Wetness Index | 0.02 |

**Flood Index = Σ (Factor rank × Weight)**, classified into five equal-interval classes: Very Low (<1.6), Low (1.6–2.4), Moderate (2.4–3.2), High (3.2–4.0), Very High (≥4.0).

### 5. Exposure Analysis
- **Agriculture at risk:** ESA WorldCover cropland (class 40) overlaid with High + Very High flood zones.
- **Population at risk:** WorldPop population summed over High + Very High flood zones, reported as a total and as a percentage of the district population.

## 🚀 How to Use

1. Open the [Google Earth Engine Code Editor](https://code.earthengine.google.com/).
2. Paste the script and click **Run**.
3. Choose a **module** (Indices / Waterlogging / Flood Hazard).
4. Select **district, year and month**, then click the relevant button.
5. Read statistics in the side panel, view charts, or export results.

## ⚠️ Limitations

- Waterlogging thresholds are empirical and should be validated against field data or flood inventories.
- Flood susceptibility weights are expert-assigned, not statistically derived (no AHP/ML calibration yet).
- Sentinel-2 results depend on cloud-free availability, which is limited during the monsoon.
- Rainfall, soil moisture and Sentinel inputs for flood analysis use 2024 data.

## 🔮 Future Scope

- AHP / machine-learning (RF, XGBoost) weight calibration
- Sentinel-1 based flood extent mapping for specific events
- Validation with historical flood records and accuracy assessment
- Drainage density, multi-year rainfall and extreme-event layers

## 👩‍💻 Author

**Yashvi Goyal**
M.Tech, Indian Institute of Technology (IIT) Kharagpur
Internship: National Institute of Hydrology (NIH), Roorkee
Guide: Dr. D. S. Bisht

## 📄 License

Released for academic and research use. Please cite this work if you use it.
