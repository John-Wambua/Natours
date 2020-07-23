
export const displayMap=locations=>{
  mapboxgl.accessToken =
    'pk.eyJ1IjoiandhbWJ1YSIsImEiOiJja2N4bWlzdWIwMWluMnltcnh0dXpxN2hwIn0.i_7gvX3d8-kjjLG3JyN9Lw';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jwambua/ckcxmpoy710go1iqun3jdwx3l',
    scrollZoom:false
    // center:[36.8219,-1.2921],
    // zoom:12,
    // interactive:false
  });
  const bounds =new mapboxgl.LngLatBounds()

  locations.forEach(loc=>{
    //Create Marker
    const el=document.createElement('div');
    el.className='marker';
    //Add marker
    new mapboxgl.Marker({
      element:el,
      anchor:'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`)
      .setMaxWidth("300px")
      .addTo(map);


    //Extend map bounds to include current location
    bounds.extend(loc.coordinates)
  })
  map.fitBounds(bounds,{
    padding:{
      top:200,
      bottom:150,
      left:100,
      right:100,
    }
  })

}
