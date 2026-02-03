const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE =  62;

/**
 *Encode a number to Base62 string
 */

function encode(num){
    if(num==0) return CHARSET[0];

    let encode = '';
    while(num>0){
	encoded = CHARSET[num%BASE] + encoded;
	num  = Math.floor(num/BASE);
    }
    return encoded;
}

/**
 *Decode a Base62 string to number
 */

function decode(str){
    let decoded = 0;
    for (let i=0;i<str.length;i++){
	decoded  = decoded*BASE+CHARSET.indexOf(str[i]);
    }
    return decoded;
}

/**
 * Pad Base62 string to minimum length
 */

function pad(str,length){
    while(str.length<length){
    	str = CHARSET[0] + str; // Pad with '0'	
    }
    return str;
}

export {encode,decode,pad,CHARSET};
