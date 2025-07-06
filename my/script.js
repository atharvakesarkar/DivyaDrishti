  // Divyadrishti - Air Quality Monitoring System
  // JavaScript functionality to match React app exactly

  class AirQualityApp {
      constructor() {
          this.currentData = null;
          this.currentLocation = 'Delhi';
          this.currentLanguage = 'en';
          this.activeLayer = 'pollution';
          this.API_KEY = 'ced1663cfab4c7f67215937fe373e9d31dd95771';
          
          // Chart instances
          this.pollutantChart = null;
          this.distributionChart = null;
          this.trendChart = null;
          
          this.init();
      }
      
      init() {
          this.setupEventListeners();
          this.fetchAirQualityData(this.currentLocation);
          this.updateTimestamp();
          setInterval(() => this.updateTimestamp(), 60000); // Update every minute
      }
      
      setupEventListeners() {
          // Search functionality
          document.getElementById('searchBtn').addEventListener('click', () => {
              const location = document.getElementById('locationInput').value.trim();
              if (location) {
                  this.fetchAirQualityData(location);
                  this.currentLocation = location;
              }
          });
          
          // Enter key for search
          document.getElementById('locationInput').addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                  const location = e.target.value.trim();
                  if (location) {
                      this.fetchAirQualityData(location);
                      this.currentLocation = location;
                  }
              }
          });
          
          // Language toggle
          document.getElementById('languageToggle').addEventListener('click', () => {
              this.toggleLanguage();
          });
          
          // Refresh button
          document.getElementById('refreshBtn').addEventListener('click', () => {
              this.fetchAirQualityData(this.currentLocation);
              document.querySelector('.refresh-icon').style.transform = 'rotate(360deg)';
              setTimeout(() => {
                  document.querySelector('.refresh-icon').style.transform = 'rotate(0deg)';
              }, 300);
          });
          
          // Satellite layer buttons
          document.querySelectorAll('.layer-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                  this.switchSatelliteLayer(btn.dataset.layer);
              });
          });
          
          // Chat button (placeholder)
          document.getElementById('chatBtn').addEventListener('click', () => {
              alert('Chat functionality would be implemented here');
          });
      }
      
      async fetchAirQualityData(location) {
          try {
              // Show loading state
              document.getElementById('aqiNumber').textContent = '...';
              document.getElementById('currentLocation').textContent = location;
              
              let url;
              if (location.includes(',')) {
                  // Coordinates format: "lat,lon"
                  const [lat, lon] = location.split(',');
                  url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${this.API_KEY}`;
              } else {
                  // City name
                  url = `https://api.waqi.info/feed/${encodeURIComponent(location)}/?token=${this.API_KEY}`;
              }
              
              const response = await fetch(url);
              
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const result = await response.json();
              
              if (result.status === 'error') {
                  throw new Error(result.data || 'Failed to fetch air quality data');
              }
              
              if (!result.data) {
                  throw new Error('No data available for this location');
              }
              
              const aqiData = result.data;
              
              // Parse the data
              this.currentData = {
                  aqi: aqiData.aqi || 0,
                  pm25: aqiData.iaqi?.pm25?.v || 0,
                  pm10: aqiData.iaqi?.pm10?.v || 0,
                  o3: aqiData.iaqi?.o3?.v || 0,
                  no2: aqiData.iaqi?.no2?.v || 0,
                  so2: aqiData.iaqi?.so2?.v || 0,
                  co: aqiData.iaqi?.co?.v || 0,
                  temperature: aqiData.iaqi?.t?.v || 0,
                  humidity: aqiData.iaqi?.h?.v || 0,
                  pressure: aqiData.iaqi?.p?.v || 0,
                  city: aqiData.city?.name || location,
                  time: aqiData.time?.s || new Date().toISOString()
              };
              
              this.updateUI();
              this.updateCharts();
              this.updateSatelliteData();
              
          } catch (error) {
              console.error('Error fetching air quality data:', error);
              this.showError(error.message);
          }
      }
      
      updateUI() {
          if (!this.currentData) return;
          
          const { aqi, pm25, pm10, o3, no2, so2, co, city } = this.currentData;
          
          // Update main AQI display
          document.getElementById('aqiNumber').textContent = aqi;
          document.getElementById('currentLocation').textContent = city;
          
          // Update AQI status and colors
          const { status, description, color } = this.getAQIStatus(aqi);
          const statusElement = document.getElementById('aqiStatus');
          statusElement.textContent = status;
          statusElement.style.background = color;
          
          document.getElementById('aqiDescription').textContent = description;
          
          // Update pollutant values
          document.getElementById('pm25').textContent = `${pm25} µg/m³`;
          document.getElementById('pm10').textContent = `${pm10} µg/m³`;
          document.getElementById('o3').textContent = `${o3} µg/m³`;
          document.getElementById('no2').textContent = `${no2} µg/m³`;
          
          // Update health recommendations
          this.updateHealthRecommendations(aqi);
      }
      
      getAQIStatus(aqi) {
          if (aqi <= 50) {
              return {
                  status: 'Good',
                  description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
                  color: 'linear-gradient(135deg, #10b981, #059669)'
              };
          } else if (aqi <= 100) {
              return {
                  status: 'Moderate',
                  description: 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people.',
                  color: 'linear-gradient(135deg, #f59e0b, #d97706)'
              };
          } else if (aqi <= 150) {
              return {
                  status: 'Unhealthy for Sensitive Groups',
                  description: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.',
                  color: 'linear-gradient(135deg, #f97316, #ea580c)'
              };
          } else if (aqi <= 200) {
              return {
                  status: 'Unhealthy',
                  description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
                  color: 'linear-gradient(135deg, #ef4444, #dc2626)'
              };
          } else if (aqi <= 300) {
              return {
                  status: 'Very Unhealthy',
                  description: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
                  color: 'linear-gradient(135deg, #a855f7, #9333ea)'
              };
          } else {
              return {
                  status: 'Hazardous',
                  description: 'Health alert: everyone may experience more serious health effects.',
                  color: 'linear-gradient(135deg, #7f1d1d, #991b1b)'
              };
          }
      }
      
      updateHealthRecommendations(aqi) {
          const recommendationsDiv = document.getElementById('recommendations');
          let recommendations = [];
          
          if (aqi <= 50) {
              recommendations = [
                  { icon: '👍', text: 'Perfect for outdoor activities' },
                  { icon: '🚶', text: 'Ideal for jogging and exercise' },
                  { icon: '🌱', text: 'No health precautions needed' }
              ];
          } else if (aqi <= 100) {
              recommendations = [
                  { icon: '👍', text: 'Good for outdoor activities' },
                  { icon: '⚠️', text: 'Sensitive people should limit prolonged outdoor exertion' },
                  { icon: '🌱', text: 'Generally safe for most people' }
              ];
          } else if (aqi <= 150) {
              recommendations = [
                  { icon: '⚠️', text: 'Limit outdoor activities if sensitive' },
                  { icon: '🏠', text: 'Keep windows closed' },
                  { icon: '😷', text: 'Consider wearing a mask outside' }
              ];
          } else if (aqi <= 200) {
              recommendations = [
                  { icon: '🚫', text: 'Avoid outdoor activities' },
                  { icon: '😷', text: 'Wear a mask when going outside' },
                  { icon: '🏠', text: 'Stay indoors as much as possible' }
              ];
          } else {
              recommendations = [
                  { icon: '🚨', text: 'Stay indoors' },
                  { icon: '😷', text: 'Wear N95 mask if you must go out' },
                  { icon: '🏥', text: 'Seek medical attention if experiencing symptoms' }
              ];
          }
          
          recommendationsDiv.innerHTML = recommendations.map(rec => 
              `<div class="recommendation-item">
                  <span class="rec-icon">${rec.icon}</span>
                  <span>${rec.text}</span>
              </div>`
          ).join('');
      }
      
      updateCharts() {
          if (!this.currentData) return;
          
          const { pm25, pm10, o3, no2, so2, co } = this.currentData;
          
          // Update pollutant bar chart
          this.createPollutantChart(pm25, pm10, o3, no2, so2, co);
          
          // Update distribution pie chart
          this.createDistributionChart(pm25, pm10, o3, no2, so2, co);
          
          // Update 24-hour trend chart
          this.createTrendChart();
      }
      
      createPollutantChart(pm25, pm10, o3, no2, so2, co) {
          const ctx = document.getElementById('pollutantChart').getContext('2d');
          
          if (this.pollutantChart) {
              this.pollutantChart.destroy();
          }
          
          this.pollutantChart = new Chart(ctx, {
              type: 'bar',
              data: {
                  labels: ['PM2.5', 'PM10', 'O₃', 'NO₂', 'SO₂', 'CO'],
                  datasets: [{
                      label: 'Concentration (µg/m³)',
                      data: [pm25, pm10, o3, no2, so2, co],
                      backgroundColor: [
                          '#22d3ee',
                          '#60a5fa', 
                          '#f59e0b',
                          '#f97316',
                          '#ef4444',
                          '#a855f7'
                      ],
                      borderColor: [
                          '#0891b2',
                          '#3b82f6',
                          '#d97706', 
                          '#ea580c',
                          '#dc2626',
                          '#9333ea'
                      ],
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                      duration: 1000,
                      easing: 'easeOutQuart'
                  },
                  plugins: {
                      legend: {
                          display: false
                      },
                      tooltip: {
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          titleColor: '#22d3ee',
                          bodyColor: '#ffffff',
                          borderColor: '#22d3ee',
                          borderWidth: 1,
                          cornerRadius: 8,
                          displayColors: true,
                          callbacks: {
                              label: function(context) {
                                  return `${context.parsed.y} µg/m³`;
                              }
                          }
                      }
                  },
                  scales: {
                      y: {
                          beginAtZero: true,
                          ticks: {
                              color: '#22d3ee',
                              font: {
                                  size: 12,
                                  weight: '500'
                              }
                          },
                          grid: {
                              color: 'rgba(34, 211, 238, 0.1)',
                              lineWidth: 1
                          },
                          border: {
                              color: 'rgba(34, 211, 238, 0.3)'
                          }
                      },
                      x: {
                          ticks: {
                              color: '#22d3ee',
                              font: {
                                  size: 12,
                                  weight: '500'
                              }
                          },
                          grid: {
                              display: false
                          },
                          border: {
                              color: 'rgba(34, 211, 238, 0.3)'
                          }
                      }
                  }
              }
          });
      }
      
      createDistributionChart(pm25, pm10, o3, no2, so2, co) {
          const ctx = document.getElementById('distributionChart').getContext('2d');
          
          if (this.distributionChart) {
              this.distributionChart.destroy();
          }
          
          const data = [pm25, pm10, o3, no2, so2, co].filter(val => val > 0);
          const labels = ['PM2.5', 'PM10', 'O₃', 'NO₂', 'SO₂', 'CO'].filter((_, i) => [pm25, pm10, o3, no2, so2, co][i] > 0);
          
          this.distributionChart = new Chart(ctx, {
              type: 'doughnut',
              data: {
                  labels: labels,
                  datasets: [{
                      data: data,
                      backgroundColor: [
                          '#22d3ee',
                          '#60a5fa',
                          '#f59e0b',
                          '#f97316',
                          '#ef4444',
                          '#a855f7'
                      ],
                      borderColor: [
                          '#0891b2',
                          '#3b82f6',
                          '#d97706',
                          '#ea580c',
                          '#dc2626',
                          '#9333ea'
                      ],
                      borderWidth: 3,
                      hoverBorderWidth: 4,
                      hoverOffset: 8
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                      duration: 1200,
                      easing: 'easeOutQuart'
                  },
                  plugins: {
                      legend: {
                          position: 'bottom',
                          labels: {
                              color: '#22d3ee',
                              padding: 15,
                              font: {
                                  size: 11,
                                  weight: '500'
                              },
                              usePointStyle: true,
                              pointStyle: 'circle'
                          }
                      },
                      tooltip: {
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          titleColor: '#22d3ee',
                          bodyColor: '#ffffff',
                          borderColor: '#22d3ee',
                          borderWidth: 1,
                          cornerRadius: 8,
                          callbacks: {
                              label: function(context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                                  return `${context.label}: ${context.parsed} µg/m³ (${percentage}%)`;
                              }
                          }
                      }
                  },
                  cutout: '50%',
                  radius: '80%'
              }
          });
      }
      
      createTrendChart() {
          const ctx = document.getElementById('trendChart').getContext('2d');
          
          if (this.trendChart) {
              this.trendChart.destroy();
          }
          
          // Generate sample 24-hour trend data
          const hours = [];
          const aqiValues = [];
          const currentAQI = this.currentData?.aqi || 50;
          
          for (let i = 23; i >= 0; i--) {
              const hour = new Date();
              hour.setHours(hour.getHours() - i);
              hours.push(hour.getHours().toString().padStart(2, '0') + ':00');
              
              // Generate realistic AQI variations
              const variation = (Math.random() - 0.5) * 20;
              aqiValues.push(Math.max(0, Math.round(currentAQI + variation)));
          }
          
          this.trendChart = new Chart(ctx, {
              type: 'line',
              data: {
                  labels: hours,
                  datasets: [{
                      label: 'AQI',
                      data: aqiValues,
                      borderColor: '#22d3ee',
                      backgroundColor: 'rgba(34, 211, 238, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: '#22d3ee',
                      pointBorderColor: '#0891b2',
                      pointBorderWidth: 2,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                      pointHoverBackgroundColor: '#ffffff',
                      pointHoverBorderColor: '#22d3ee',
                      pointHoverBorderWidth: 3
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                      duration: 1500,
                      easing: 'easeOutQuart'
                  },
                  interaction: {
                      intersect: false,
                      mode: 'index'
                  },
                  plugins: {
                      legend: {
                          labels: {
                              color: '#22d3ee',
                              font: {
                                  size: 12,
                                  weight: '500'
                              }
                          }
                      },
                      tooltip: {
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          titleColor: '#22d3ee',
                          bodyColor: '#ffffff',
                          borderColor: '#22d3ee',
                          borderWidth: 1,
                          cornerRadius: 8,
                          callbacks: {
                              label: function(context) {
                                  return `AQI: ${context.parsed.y}`;
                              }
                          }
                      }
                  },
                  scales: {
                      y: {
                          beginAtZero: true,
                          ticks: {
                              color: '#22d3ee',
                              font: {
                                  size: 12,
                                  weight: '500'
                              }
                          },
                          grid: {
                              color: 'rgba(34, 211, 238, 0.1)',
                              lineWidth: 1
                          },
                          border: {
                              color: 'rgba(34, 211, 238, 0.3)'
                          }
                      },
                      x: {
                          ticks: {
                              color: '#22d3ee',
                              maxTicksLimit: 8,
                              font: {
                                  size: 11,
                                  weight: '500'
                              }
                          },
                          grid: {
                              color: 'rgba(34, 211, 238, 0.1)',
                              lineWidth: 1
                          },
                          border: {
                              color: 'rgba(34, 211, 238, 0.3)'
                          }
                      }
                  }
              }
          });
      }
      
      switchSatelliteLayer(layer) {
          this.activeLayer = layer;
          
          // Update active button
          document.querySelectorAll('.layer-btn').forEach(btn => {
              btn.classList.remove('active');
          });
          document.querySelector(`[data-layer="${layer}"]`).classList.add('active');
          
          // Update map display
          document.getElementById('mapLocation').textContent = `${this.currentLocation} - ${layer.charAt(0).toUpperCase() + layer.slice(1)} Layer`;
          
          // Update satellite data
          this.updateSatelliteData();
      }
      
      updateSatelliteData() {
          // Generate realistic satellite data
          const pollutionIndex = Math.floor(Math.random() * 100);
          const cloudCover = Math.floor(Math.random() * 100);
          const surfaceTemp = 15 + Math.floor(Math.random() * 25);
          
          document.getElementById('pollutionIndex').textContent = `${pollutionIndex}%`;
          document.getElementById('cloudCover').textContent = `${cloudCover}%`;
          document.getElementById('surfaceTemp').textContent = `${surfaceTemp}°C`;
          
          // Update current reading based on active layer
          const readings = {
              pollution: `${pollutionIndex}%`,
              clouds: `${cloudCover}%`,
              temperature: `${surfaceTemp}°C`
          };
          
          document.getElementById('satelliteReading').textContent = readings[this.activeLayer];
      }
      
      toggleLanguage() {
          const btn = document.getElementById('languageToggle');
          if (this.currentLanguage === 'en') {
              this.currentLanguage = 'hi';
              btn.textContent = 'हि';
              this.translateToHindi();
          } else {
              this.currentLanguage = 'en';
              btn.textContent = 'EN';
              this.translateToEnglish();
          }
      }
      
      translateToHindi() {
          // Translate key elements to Hindi
          document.querySelector('.app-subtitle').textContent = 'वायु गुणवत्ता निगरानी के लिए दिव्य दृष्टि';
          document.querySelector('.location-input').placeholder = 'एक शहर खोजें...';
          document.getElementById('searchBtn').textContent = 'खोजें';
          document.querySelector('.aqi-main-card h2').textContent = 'वायु गुणवत्ता सूचकांक';
          document.querySelector('.health-card h3').textContent = 'स्वास्थ्य सिफारिशें';
      }
      
      translateToEnglish() {
          // Translate back to English
          document.querySelector('.app-subtitle').textContent = 'Divine Vision for Air Quality Monitoring';
          document.querySelector('.location-input').placeholder = 'Search for a city...';
          document.getElementById('searchBtn').textContent = 'Search';
          document.querySelector('.aqi-main-card h2').textContent = 'Air Quality Index';
          document.querySelector('.health-card h3').textContent = 'Health Recommendations';
      }
      
      updateTimestamp() {
          const now = new Date();
          const timeString = now.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
          });
          document.getElementById('lastUpdated').textContent = timeString;
      }
      
      showError(message) {
          // Show error message
          document.getElementById('aqiNumber').textContent = '?';
          document.getElementById('aqiDescription').textContent = `Error: ${message}`;
          console.error('AQI Error:', message);
      }
  }

  // Initialize the app when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
      new AirQualityApp();
  });

  // Chart.js default configuration
  Chart.defaults.color = 'rgba(34, 211, 238, 0.8)';
  Chart.defaults.borderColor = 'rgba(34, 211, 238, 0.2)';
  Chart.defaults.backgroundColor = 'rgba(34, 211, 238, 0.1)';


  
// script.js (Leaflet version)

// Initialize the Leaflet map
const map = L.map('mapContainer').setView([28.6139, 77.2090], 5); // Delhi

// Add dark basemap from CartoDB
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

const layers = {
  pollution: {
    label: 'Pollution',
    url: 'https://tile.openweathermap.org/map/pm2_5/{z}/{x}/{y}.png?appid=6f270f2c740d629fb2d0452fe7e42ebf'
  },
  clouds: {
    label: 'Cloud Cover',
    url: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=6f270f2c740d629fb2d0452fe7e42ebf'
  },
  temperature: {
    label: 'Temperature',
    url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=6f270f2c740d629fb2d0452fe7e42ebf'
  }
};

let currentLayer = null;

function updateLayer(type) {
  const layerInfo = layers[type];
  const mapLocationText = document.getElementById('mapLocation');
  const satelliteReading = document.getElementById('satelliteReading');

  // Remove previous overlay
  if (currentLayer) {
    map.removeLayer(currentLayer);
  }

  // Add new tile layer
  currentLayer = L.tileLayer(layerInfo.url, {
    opacity: 0.6,
    attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
  }).addTo(map);

  // Update button UI
  document.querySelectorAll('.layer-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-layer="${type}"]`).classList.add('active');

  // Update UI text
  mapLocationText.textContent = `Delhi - ${layerInfo.label} Layer`;
  if (type === 'pollution') {
    satelliteReading.textContent = `${Math.floor(Math.random() * 100)}% PM2.5 Concentration`;
  } else if (type === 'clouds') {
    satelliteReading.textContent = `${Math.floor(Math.random() * 100)}% Cloud Cover`;
  } else {
    satelliteReading.textContent = `${15 + Math.floor(Math.random() * 15)}°C Surface Temperature`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateLayer('pollution');

  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLayer = btn.dataset.layer;
      updateLayer(selectedLayer);
    });
  });
});
