<template>
    <v-ons-page class="bg-white" v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left">
                <router-link :to="{path: '/login'}" class="btn">
                    <i class="ion-chevron-left"></i>&nbsp;{{lang.login}}
                </router-link>
            </div>
            <div class="center">{{lang.register}}</div>
            <div class="right">
                &nbsp;
            </div>
        </v-ons-toolbar>
        <div class="content">
            <div class="d-flex flex-column h-100 p-2 register-page">
                <div class="flex-grow-1 d-flex flex-column form-wrapper border-radius-5 bg-white pt-5 px-4 pb-4">
                    <div class="flex-grow-1">
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.phone}}</label>
                            <input type="number" class="form-control col-9" v-model="params.phone"
                                   :placeholder="lang.please_input_phone">
                        </div>
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.verify_code}}</label>
                            <div class="input-group col-9 pl-0">
                                <input type="number" class="form-control " v-model="params.verify_code"
                                       :placeholder="lang.please_input_verify_code">
                                <div class="input-group-append d-flex align-items-center">
                                <span v-if="verifyCode.count === 0" @click="sendVerifyCode"
                                      class="btn btn-sm btn-success btn-verify-code">{{lang.send_verify_code}}</span>
                                    <span v-if="verifyCode.count > 0" class="btn btn-sm btn-verify-code">{{verifyCode.count + lang.waiting_verify_code}}</span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.name}}</label>
                            <input class="form-control col-9" v-model="params.name"
                                   :placeholder="lang.please_input_profile_name">
                        </div>
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.residence}}</label>
                            <div class="d-flex align-items-center col-9" >
                                <span class="flex-grow-1 font-size-13" @click="bindResidence = true" v-bind:class="params.residence === ''?'text-muted':''">{{params.residence === ''?lang.please_input_residence:params.residence}}</span>
                                <div class="pl-2 d-flex align-items-center" @click="bindLocation"><i class="ion-location"></i>&nbsp; <span class="font-size-12">{{ lang.bind_location}}</span> </div>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.address}}</label>
                            <input class="form-control col-9" v-model="params.address"
                                   :placeholder="lang.please_input_address">
                        </div>
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.password}}</label>
                            <input type="password" class="form-control col-9" v-model="params.password"
                                   :placeholder="lang.please_input_password">
                        </div>
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.password_confirmation}}</label>
                            <input type="password" class="form-control col-9" v-model="params.password_confirmation"
                                   :placeholder="lang.please_input_password_again">
                        </div>
                        <div class="form-group" style="display: none">
                            <label class="left">
                                <v-ons-checkbox
                                        v-model="isReadAgreement"
                                >
                                </v-ons-checkbox>
                                {{lang.agreed_our_policy}} <a>初考</a>
                            </label>
                        </div>
                    </div>
                    <div class="pb-2">
                        <button class="btn btn-success btn-block" @click="saveRegister" :disabled="loading">{{lang.register}}</button>
                    </div>
                </div>

            </div>
            <div class="position-absolute residence-wrapper d-flex flex-column" v-bind:class="bindResidence?'active':''">
                <div class="flex-grow-1"></div>
                <div class="px-2 bg-white">
                    <div class="d-flex justify-content-between pt-2 mb-3">
                        <button @click="bindResidence = false" class="btn btn-outline-dark btn-sm px-3">{{lang.cancel}}</button>
                        <button @click="saveResidence" class="btn btn-outline-success btn-sm px-3">{{lang.decide}}</button>
                    </div>
                    <div class="d-flex justify-content-between">
                        <scroll-picker :options="parentResidences" v-model="temp.province_id"></scroll-picker>
                        <scroll-picker :options="childResidences" v-model="temp.city_id"></scroll-picker>
                    </div>

                </div>
            </div>
            <div class="position-absolute residence-wrapper d-flex flex-column bg-white" v-bind:class="bindingLocation?'active':''">
                <div class="px-2 bg-white">
                    <div class="flex-grow-1"></div>
                    <div class="d-flex justify-content-between pt-2 mb-3">
                        <button @click="bindingLocation = false" class="btn btn-outline-dark btn-sm px-3">{{lang.cancel}}</button>
                        <button @click="saveGeoLocation" class="btn btn-outline-primary btn-sm px-3" :disabled="places.length === 0"> {{lang.decide}}</button>
                    </div>
                    <div class="position-relative w-100 amap-wrapper">
                        <div class=" w-100" style="height: 300px;" id="map_root">
                        </div>
                        <img :src="setting.ASSET_URL + 'images/icon/map_pin_32.png'" class="center-pin"/>
                    </div>

                    <div class="flex-grow-1 pt-2 place-autocomplete-wrapper">
                        <ul>
                            <li v-for="(place,index) in places" @click="choosePlace(place)" :class="index ===0?'active':''">
                                <span class="name">{{place.name}}</span>
                                <span class="address">{{place.address}}</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    </v-ons-page>
</template>

<script>
    import Vue from "vue";
    import VueAMap from "vue-amap";
    import { lazyAMapApiLoaderInstance } from 'vue-amap';
    import axios from 'axios';
    import config from "@/config";
    import constants from "@/js/constants";
    import locale from "@/js/locale";
    import router from "@/router";
    import {validCheck, validPhone, getResponseErrorMsg, requestSend, payViaWechat,getDeviceSinInfo} from "@/js/common";
    import VueScrollPicker from "vue-scroll-picker";
    import "vue-scroll-picker/dist/style.css";
    Vue.use(VueScrollPicker);
    Vue.use(VueAMap);
    VueAMap.initAMapApiLoader({
        key: config.AMAP_KEY,
        plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch','AMap.Geolocation', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType'],
        v: '1.4.4'
    });

    let self,map,marker = null;
    export default {
        data() {
            return {
                loading: false,
                isReadAgreement: true,
                bindResidence: false,
                bindingLocation:false,
                detectedGeolocation:'',
                detectedGeoData:null,
                detectingGeoData:false,
                detectedGeoValue:null,
                setting:null,
                places:[],
                params: {
                    phone: '',
                    verify_code: '',
                    province_id: 0,
                    city_id: 0,
                    residence: '',
                    address: '',
                    name: '',
                    password_confirmation: '',
                    password: '',
                    geodata:null,
                    unionId:null,
                    profileUrl:null
                },
                temp:{
                    province_id: 0,
                    city_id: 0,
                },
                verifyCode: {
                    sendingVerifyCode: false,
                    count: 0,
                    timer: null,
                },
                residences: [],
                parentResidences: [],
                childResidences:[],
                rules: {
                    'phone': ['required', 'phone'],
                    'name' :['required'],
                    'residence':['required'],
                    'address':['required'],
                    'password': ['required', 'password'],
                    'password_confirmation':['required','confirmed'],
                    'verify_code':['required','verifyCode'],
                }
            }
        },
        created() {
            this.lang = locale;
            this.setting = config;
            this.getResidence();
            self = this
        },
        mounted() {
            this.registerWechat();
           /* getDeviceSinInfo.then((resp =>{
                alert(JSON.stringify(resp));
            }));*/
        },
        methods: {
            registerWechat() {
                payViaWechat().then((weResp => {
                    let scope = "snsapi_userinfo",
                        state = "_" + (+new Date());
                    if (weResp.status) {
                        let Wechat = weResp.obj;
                        Wechat.auth(scope,state,function (resp) {
                            const code = resp.code;
                            const url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.WECHATCLIENTID + '&secret=' + config.WECHATSECRET + '&code=' + code + '&grant_type=authorization_code';
                            axios.get(url).then((accessTokenResponse => {
                                const data = accessTokenResponse.data;
                                const accessToken = data.access_token;
                                const openId = data.openid;
                                const url2 = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + accessToken + '&openid=' + openId + '&lang=zh_CN';
                                axios.get(url2).then(resp2 => {
                                    const userInfo = resp2.data;
                                    self.params.profileUrl = userInfo.headimgurl;
                                    self.params.unionId = userInfo.unionid;
                                    self.params.name = userInfo.nickname;
                                });
                            }))
                        }, function (reason) {
                            self.$ons.notification.alert(locale.INVALID_PARAM,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                        })
                    } else {
                        self.$ons.notification.alert(locale.weixin_not_support,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    }
                }));
            },
            sendVerifyCode() {
                if (!validPhone(this.params.phone)) {
                    this.$ons.notification.toast(locale.wrong_mobile_format, {timeout: 2000});
                    return
                }
                const TIME_COUNT = 60;
                axios.post(config.API_URL + 'verify-phone',{phone:this.params.phone}).then((resp => {
                    if (!this.verifyCode.timer && resp.data.status === constants.RES_SUCCESS ) {
                        self.verifyCode.count = TIME_COUNT;
                        self.verifyCode.timer = setInterval(() => {
                            if (self.verifyCode.count > 0 && self.verifyCode.count <= TIME_COUNT) {
                                self.verifyCode.count--;
                            } else {
                                clearInterval(self.verifyCode.timer);
                                self.verifyCode.timer = null;
                            }
                        }, 1000)
                    }
                }))

            },
            saveRegister() {

                this.loading = true;
                let errorMsg = validCheck(this.params, this.rules)

                if(errorMsg !== null) {
                    this.loading = false;
                    this.$ons.notification.toast(errorMsg, { timeout: 1000 });
                    return ;
                }
                this.params.geodata = JSON.stringify(this.detectedGeoValue);
                requestSend(config.API_URL + 'register/user', this.params).then((resp) => {
                    this.loading = false;
                    if (resp.status === constants.RES_SUCCESS) {
                        const token = resp.token;
                        const me = JSON.stringify(resp.result);
                        localStorage.setItem('token', token)
                        localStorage.setItem('me', me);
                        router.push('/')
                    } else {
                        this.$ons.notification.alert(locale.INVALID_PARAM,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    }
                }).catch(((error) => {
                    this.loading = false;
                    const msg = getResponseErrorMsg(error.response.data)
                    this.$ons.notification.alert(locale.INVALID_PARAM,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                }))

            },
            saveResidence() {
                this.params.province_id = this.temp.province_id
                this.params.city_id = this.temp.city_id
                this.params.residence = this.getResidenceName(this.params.province_id,this.params.city_id)
                this.bindResidence = false
            },
            getResidence() {
                const residence = localStorage.getItem('residence')
                if (residence === null ) {
                    axios.post(config.API_URL + 'get-residence').then((resp) => {
                        resp = resp.data
                        this.residences = resp;
                        this.parentResidences = this.residences.map(function (val) {
                            return {'value': val.id, 'name': val.name}
                        })
                        localStorage.setItem('residence', JSON.stringify(resp))
                    }).catch(((error, resp) => {
                        this.$ons.notification.alert(locale.INVALID_PARAM,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    }))
                } else
                    this.residences = JSON.parse(residence);
                this.parentResidences = this.residences.map(function (val) {
                    return {'value': val.id, 'name': val.name}
                });
            },
            getResidenceName(province,city) {
                let name = '';
                const parent = this.residences.filter(val => val.id=== province);
                if(parent.length > 0) {
                    name += parent[0].name;
                    const child = parent[0].child.filter(val => val.id === city)
                    if(child.length > 0)
                        name += ' '+ child[0].name
                }
                return name;
            },
            saveGeoLocation() {
                if(this.places.length > 0) {
                    self.choosePlace(this.places[0]);
                }
            },
            bindLocation() {
                this.bindingLocation = true;
                lazyAMapApiLoaderInstance.load().then(() => {

                    map = new AMap.Map('map_root', {
                        zoom:13,
                    });
                    map.on('moveend',(e => {
                        let center = map.getCenter();
                        self.geocoder(center.getLng(),center.getLat()).then(data => {
                            if(data.status) {
                                self.detectedGeolocation = data.result.formattedAddress;
                                self.detectedGeoData = data.result;
                                self.detectedGeoValue =[center.getLng(),center.getLat()];
                                self.placeSearchPoint();
                            }
                        })
                    }));
                    /*map.on('click',(e => {
                        /!*if (!marker) {
                            marker = new AMap.Marker({ map: map })
                        }*!/
                        console.log('this maker position')
                        console.log([e.lnglat.getLng(), e.lnglat.getLat()]);
                       // marker.setPosition([e.lnglat.getLng(), e.lnglat.getLat()])
                        self.geocoder(e.lnglat.getLng(), e.lnglat.getLat()).then(data => {
                            if(data.status) {
                                self.detectedGeolocation = data.result.formattedAddress;
                                self.detectedGeoData = data.result;
                                self.detectedGeoValue = [e.lnglat.getLng(), e.lnglat.getLat()];
                                self.placeSearchPoint();
                            }
                        })
                    }));*/
                    map.plugin('AMap.Geolocation', function() {
                        let geolocation = new AMap.Geolocation({
                            enableHighAccuracy : true, //Whether to use high-precision positioning, default: true
                            timeout : 10000, //Stop positioning after more than 10 seconds, default: infinity
                            buttonOffset : new AMap.Pixel(10, 20), //Offset between the positioning button and the set docking position, default: Pixel(10, 20)
                            zoomToAccuracy : true, //After the positioning is successful, adjust the field of view of the map to make it visible in the field of view of the positioning position and accuracy range. Default: false
                            buttonPosition : 'RB'
                        });
                        map.addControl(geolocation);
                        geolocation.getCurrentPosition();
                        AMap.event.addListener(geolocation, 'complete', (data => {
                            /*marker = new AMap.Marker({
                                position : [data.position.getLng(), data.position.getLat()],
                                map : map
                            });*/
                            self.geocoder(data.position.getLng(), data.position.getLat(), data.addressComponent.citycode).then(geoLoc => {
                                if(geoLoc.status) {
                                    self.detectedGeolocation = geoLoc.result.formattedAddress;
                                    self.detectedGeoData = geoLoc.result;
                                    self.detectedGeoValue = [data.position.getLng(), data.position.getLat()];
                                    self.placeSearchPoint();
                                }

                            })
                        }));
                        //Return positioning information
                        AMap.event.addListener(geolocation, 'error', (data => {
                            self.$ons.notification.alert('获取定位信息失败！',{title:locale.alert_title,buttonLabel:locale.alert_ok});
                        }));
                        //Return positioning error message
                    });
                });

            },
            geocoder(lngX,lngY,cityCode) {
                return new Promise(function (resolve, reject) {
                    map.plugin('AMap.Geocoder', function() {
                        let geocoder = new AMap.Geocoder({
                            city : cityCode, //City, default: "national"
                            radius : 500 //Range, default: 500
                        });
                        geocoder.getAddress([lngX, lngY], function (status, result) {
                            if (status === 'complete' && result.info === 'OK') {
                                resolve({status:true,result:result.regeocode});
                            } else {
                                resolve({status:false})
                            }
                        });
                    });
                });

            },
            placeSearchPoint(existData = false) {

                if(this.detectedGeoData === null && existData === false)
                    return false;
                let cityCode,address = "";
                if(!existData) {
                    let info = this.detectedGeoData.addressComponent;
                    cityCode = info.adcode === ""?info.citycode:info.adcode;
                    address =  this.detectedGeolocation.replace(info.province+info.city,"");
                } else {
                    cityCode = self.getResidenceName(self.my.province_id,self.my.city_id,true);
                    address = self.my.address;
                }
                AMap.service('AMap.PlaceSearch',function () {
                    let  placeSearch = new AMap.PlaceSearch({
                        city: cityCode,
                    });
                    placeSearch.search(address, function (status, result) {
                        if(status === 'complete') {
                            self.places = result.poiList.pois;
                        }
                    });
                })
            },
            choosePlace(item) {
                let address = item.name;
                this.detectedGeoValue = [item.location.R,item.location.Q];
                let info,residence = null;
                if(this.detectedGeoData !== null) {
                    info = this.detectedGeoData.addressComponent;
                    residence = this.residences.filter(val => val.name === info.province);
                    if(residence.length > 0){
                        const cityname = info.city!== ""?info.city:info.district;
                        const city = residence[0].child.filter(val => val.name === cityname);
                        if(city.length > 0) {
                            this.params.province_id = residence[0].id;
                            this.params.city_id = city[0].id;
                            this.params.residence = this.getResidenceName(this.params.province_id,this.params.city_id);
                            this.params.address = address;
                            this.params.geodata = JSON.stringify(this.detectedGeoValue);
                            this.bindingLocation = false;
                        }
                    }
                } else {
                    this.params.address = address;
                    this.params.geodata = JSON.stringify(this.detectedGeoValue);
                    this.bindingLocation = false;
                }
            }
        },
        watch:{
            'temp.province_id':function (newVal) {
                const residence = this.residences.filter(val => val.id=== newVal)
                if(residence.length > 0) {
                    this.childResidences = residence[0].child.map(function (val) {
                        return {'value': val.id, 'name': val.name}
                    })
                }
            }
        }
    }
</script>
