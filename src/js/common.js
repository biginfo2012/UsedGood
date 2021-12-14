import axios from "axios";
import constants from "@/js/constants";
import router from "@/router";
import locale from "@/js/locale";

export const requestSend = (url,params,method = constants.METHOD_POST,multipart = false) => {

    return new Promise(function (resolve, reject) {
        const header = {'Authorization':localStorage.getItem('token')};
        if(multipart)
            header['Content-Type'] = 'multipart/form-data';
        if(method === constants.METHOD_POST) {
            axios.post(url,params,{headers:header}).then((resp) => {
                resp = resp.data
                if(resp.status === constants.RES_ERROR) {
                    if(resp.msg === constants.ERR_TOKEN_EXPIRED || resp.msg === constants.ERR_INVALID_TOKEN) {
                        //alert('token error')
                       // localStorage.removeItem('token')
                        router.push('/login')
                        reject(resp)
                    }

                }
                resolve(resp)
            }).catch(((error, resp) => {
                resolve(error.response)
            }))
        } else {
            axios.get(url,{headers:header}).then((resp) => {
                resolve(resp.data)
            })
        }
    })
};

export const validCheck = (params,rules) =>{
    let errorMsg = null
    let value = '';
    for(let [key,val] of Object.entries(rules)) {
        value = params[key] !== undefined?params[key]:null;
        if(val.includes('required') && (value === '' || value === null))
            errorMsg = locale[key]+locale.is_mandatory
        else if(val.includes('email') && !validEmail(value))
            errorMsg = locale.wrong_email_format
        else if(val.includes('phone') && !validPhone(value))
            errorMsg = locale.wrong_mobile_format
        else if(val.includes('password') && value.length < 6)
            errorMsg = locale.password_length_bigger_six
        else if(val.includes('verifyCode') && value.length !== 6)
            errorMsg = locale.verify_code_length_6
        else if(val.includes('confirmed') && value !== params['password']) {
            errorMsg = locale.password_not_confirmed
        }
        if(errorMsg !== null)
            return errorMsg

    }

    return errorMsg

};

export const validEmail = (email) => {
    if(email === '' || email === null)
        return false
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export const validPhone = (val) => {
    if(val === '' || val === null)
        return false
    const re = /^[0-9]{11}$/;
    return re.test(val);
}

export const getResponseErrorMsg = (value) => {
    let errorMsg = '';
    if(value.msg === constants.INVALID_PARAM) {
        for(let [key,val] of Object.entries(value.errors)) {
            if(val.includes(constants.ERR_DUPLICATED_VALUE))
                errorMsg += locale.ERR_DUPLICATED_VALUE+'\n';
            if(val.includes(constants.ERR_INVALID_CODE))
                errorMsg += locale.ERR_INVALID_CODE+'\n';
        }
    }
    return errorMsg

}

export const loadInAppBrowser = () => {
    return new Promise(function (resolve, reject) {
        document.addEventListener('deviceready', () => {
            resolve(cordova.InAppBrowser)
        }, false)
    })
};

export const deviceReady = () => {
    return new Promise(function (resolve, reject) {
        document.addEventListener('deviceready', () => {
            let camera = navigator.camera;
            camera.getPicture ((img) =>{
                img = 'data:image/jpeg;base64,' + img;
               // let blob = b64toBlob(img,'image/jpeg');
                resolve({status:true,data:img})
            }, (msg) =>{
                resolve({status:false,result:msg})
            }, {destinationType: camera.DestinationType.DATA_URL});

        }, false)
    })

};

export const checkPermission = () => {
    return new Promise(function (resolve, reject) {
        document.addEventListener('deviceready', () => {
            var permissions = cordova.plugins.permissions;
            permissions.hasPermission(permissions.READ_EXTERNAL_STORAGE, function (status) {
                if (status.hasPermission) {
                   resolve(true);
                } else {
                    // Request the permission to read files from external storage.
                    permissions.requestPermission(permissions.READ_EXTERNAL_STORAGE, () =>{
                        resolve(true);
                    }, () =>{
                        resolve(false);
                    });
                }
            })
        }, false)
    })
}

export const deviceReadyVideo = () => {
    return new Promise(function (resolve, reject) {
        document.addEventListener('deviceready', () => {
            navigator.device.capture.captureVideo((media) => {
                /*let videoFile = media[0],
                    fileReader = new FileReader(),
                    file;
                fileReader.onload = function (readerEvt) {
                    var base64 = readerEvt.target.result;
                    resolve({status:true,data:base64})
                };
                //fileReader.reasAsDataURL(videoFile); //This will result in your problem.
                file = new window.File(videoFile.name, videoFile.localURL,
                    videoFile.type, videoFile.lastModifiedDate, videoFile.size);
                fileReader.readAsDataURL(file);*/
                resolve({status:true,data:media[0]})
            }, (error) => {
                resolve({status:false,data:error})
            },{limit:1,duration:300,quality:0.5});

        }, false)
    })

};



export const deviceReadyAudio = () => {
    return new Promise(function (resolve, reject) {
        document.addEventListener('deviceready', () => {
            navigator.device.capture.captureAudio((media) => {
                resolve({status:true,data:media[0]})
            }, (error) => {
                resolve({status:false,data:error})
            },{limit:1});

        }, false)
    })

};

/*const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});*/

export const toBase64 = media => new Promise((resolve, reject) => {
    let videoFile = media,
        fileReader = new FileReader(),
        file;
    fileReader.onload = function (readerEvt) {
        var base64 = readerEvt.target.result;
        resolve({status:true,data:base64})
    };
    //fileReader.reasAsDataURL(videoFile); //This will result in your problem.
    file = new window.File(videoFile.name, videoFile.localURL,
        videoFile.type, videoFile.lastModifiedDate, videoFile.size);
    fileReader.readAsDataURL(file);
});

export const getDeviceSinInfo = () => {
    return new Promise(function (resolve, reject) {
        document.addEventListener('deviceready', () => {
            window.plugins.sim.getSimInfo((result) =>{
                resolve(result);
            }, (error) =>{
                resolve(error);
            });
        }, false)
    })
};

export const randomString = (len) => {
    var chars = '1234567890';
    var maxPos = chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

export const payViaWechat = () => {

    return new Promise(function (resolve, reject) {

        document.addEventListener('deviceready', () => {
            Wechat
                .isInstalled(function(installed) {
                    resolve({status:true,obj:Wechat})
                }, function(reason) {
                    resolve({status:false});
                });
        }, false)
    })
};


export  const imageToBlob = (image, sliceSize = null)=> {
    let block = image.split(";");
    let contentType = block[0].split(":")[1];
    let b64Data = block[1].split(",")[1];
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        let byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
}

export const initialize = () => {
   document.addEventListener('deviceready', () => {
        /*document.addEventListener("backbutton", function (e) {
           e.preventDefault();
        }, false); // return key*/
    }, false)
};


//return key
function eventBackButton() {
    // confirm ( "Click again to exit!");
    alert('click again to exit!');
    console.log('this clicked');
    document.removeEventListener("backbutton", eventBackButton, false); // write-off return key
    After
    another
    three
    seconds // Registration
    var intervalID = window.setInterval(
        function () {
            window.clearInterval(intervalID);
            document.addEventListener("backbutton", eventBackButton, false); // return key
        },
        3000
    );
}

export const GetFileBlobUsingURL = function (url, convertBlob) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.addEventListener('load', function() {
        convertBlob(xhr.response);
    });
    xhr.send();
};

const blobToFile = function (blob, name) {
    blob.lastModifiedDate = new Date();
    blob.name = name;
    return blob;
};

export const GetFileObjectFromURL = function(filePathOrUrl) {
    return new Promise(function (resolve, reject) {
        GetFileBlobUsingURL(filePathOrUrl, function (blob) {
            //resolve(blob);
            toBase64(blob).then(r1 => {
                resolve(r1);
            })

           // convertBlob(blobToFile(blob, 'testFile.mp4'));
        });
    });

};
