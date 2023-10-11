

export const displayMap = function(locations){


mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/superpanch/clniv965v005k01nugj8833aq',
  scrollZoom: false
});

//create bounds objects
const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc,i) => {
  //create marker elements
  const html = document.createElement('div').classList.add('marker')
  
  //create marker and popup
  new mapboxgl.Marker(html)
  .setLngLat(loc.coordinates)
  .setPopup(new mapboxgl.Popup().setHTML(`<p>Day ${i+1} ${loc.description}</p>`))
  .addTo(map);

  // to extend method expect just one element for each time is called! 

  bounds.extend(loc.coordinates)
})


//fit bounds in view
map.fitBounds(bounds,{
  padding:{
    top: 200,
    bottom:150,
    left:100,
    right:100
    }
})
 
};
