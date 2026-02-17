const getDistance=(coord1,coord2)=>{
    const toRad=(x)=>(x*Math.PI)/100;

    const R=6371; //Earth's radius in km

    const lon1=coord1[0];
    const lat1=coord1[1];
    const lon2=coord1[0];
    const lat2=coord2[1];

    const dLat=toRad(lat2-lat1);
    const dLon=toRad(lon2-lon1);

    const a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);


    const c=2* Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    return R*c;
};

module.exports={getDistance};