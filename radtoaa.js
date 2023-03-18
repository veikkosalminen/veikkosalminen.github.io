function RadToAA(ra, de, obs) {

    // Extensions to the Math routines - Trig routines in degrees

    function rev(angle){return angle-Math.floor(angle/360.0)*360.0;}
    function sind(angle){return Math.sin((angle*Math.PI)/180.0);}
    function cosd(angle){return Math.cos((angle*Math.PI)/180.0);}
    function tand(angle){return Math.tan((angle*Math.PI)/180.0);}
    function asind(c){return (180.0/Math.PI)*Math.asin(c);}
    function acosd(c){return (180.0/Math.PI)*Math.acos(c);}
    function atan2d(y,x){return (180.0/Math.PI)*Math.atan(y/x)-180.0*(x<0);}

    // The Julian date at 0 hours UT at Greenwich

    function jd0(year,month,day) {
        var y  = year;
        var m = month;
        if (m < 3) {m += 12; y -= 1};
        var a = Math.floor(y/100);
        var b = 2-a+Math.floor(a/4);
        var j = Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+day+b-1524.5;
        return j;
    }

    // sidereal time in hours for Greenwich

    function g_sidereal(year,month,day) {
        var T=(jd0(year,month,day)-2451545.0)/36525;
        var res=100.46061837+T*(36000.770053608+T*(0.000387933-T/38710000.0));
        return rev(res)/15.0;
    }

    function local_sidereal(obs) {
        var res=g_sidereal(obs.year,obs.month,obs.day);
        res+=1.00273790935*(obs.hours+(obs.minutes+obs.tz+(obs.seconds/60.0))/60.0);
        res-=obs.longitude/15.0;
        while (res < 0) res+=24.0;
        while (res > 24) res-=24.0;
        return res;
    }

    function radtoaa(ra,dec,obs) {
        var lst=local_sidereal(obs);
        var x=cosd(15.0*(lst-ra))*cosd(dec);
        var y=sind(15.0*(lst-ra))*cosd(dec);
        var z=sind(dec);
        // rotate so z is the local zenith
        var xhor=x*sind(obs.latitude)-z*cosd(obs.latitude);
        var yhor=y;
        var zhor=x*cosd(obs.latitude)+z*sind(obs.latitude);
        var azimuth=rev(atan2d(yhor,xhor)+180.0); // so 0 degrees is north
        var altitude=atan2d(zhor,Math.sqrt(xhor*xhor+yhor*yhor));
        return new Array(altitude,azimuth);
    }

    // anglestring return angle as degrees:minutes
    // circle is true for range between 0 and 360 and false for -90 to +90

    function anglestring(a,circle) {
        var ar=Math.round(a*60*60)/60/60;
        var deg=Math.abs(ar);
        var min=60.0*(deg-Math.floor(deg));
        var sec=Math.floor(60.0*(min-Math.floor(min)));
        if (min >= 60) { deg+=1; min=0; }
        var anglestr="";
        if (!circle) anglestr+=(ar < 0 ? "-" : "+");
        if (circle) anglestr+=((Math.floor(deg) < 100) ? "0" : "" );
        anglestr+=((Math.floor(deg) < 10) ? "0" : "" )+Math.floor(deg);
        anglestr+=((Math.floor(min) < 10) ? ":0" : ":" )+Math.floor(min);
        anglestr+=((sec < 10) ? ":0" : ":" )+(sec);
        return anglestr;
    }

    function parsecol(str) {
        var col1=str.indexOf(":");
        var col2=str.lastIndexOf(":");
        if (col1 < 0) return parseInt(str);
        if (str.substring(0,1) == "-") {
            var res=parseInt(str.substring(1,col1),10);
        } else {
            var res=parseInt(str.substring(0,col1),10);
        }
        if (col2 > col1) {
            res+=(parseInt(str.substring(col1+1,col2),10)/60.0) +
                (parseInt(str.substring(col2+1,str.length),10)/3600.0);
        } else {
            res+=(parseInt(str.substring(col1+1,str.length),10)/60.0);
        }
        if (str.substring(0,1) == "-") {
            return -res;
        } else {
            return res;
        }
    }

    const altaz = radtoaa(parsecol(ra), parsecol(de), obs)
    return {alt: altaz[0], az: altaz[1]}
}
