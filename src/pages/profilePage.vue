<template>
    <v-ons-page class="bg-1 profile-page" v-bind:class="loading?'loading':''">
        <v-ons-toolbar class="navigate">
            <div class="left">
                <router-link :to="{path: '/my'}" class="btn">
                    <i class="ion-chevron-left"></i>&nbsp;{{lang.back}}
                </router-link>
            </div>
            <div class="center">{{lang.my_profile}}</div>
            <div class="right">
                &nbsp;
            </div>
        </v-ons-toolbar>
        <div class="content">
            <div class="d-flex flex-column h-100 p-2 register-page">
                <div class="flex-grow-1 d-flex flex-column  form-wrapper border-radius-5 bg-white pt-5 px-4 pb-4">
                    <div class="flex-grow-1">
                        <div class="form-group row " @click="settingProfile('avatar')">
                            <label class="col-form-label d-flex align-items-center col-3">{{lang.avatar}}</label>
                            <div class="input-group d-flex align-items-center justify-content-end col-9 pl-0">
                                <img class="avatar" :src="my.avatar" @error="setAltImg"/>
                                <span class="ion-chevron-right pl-2"></span>
                                <input type="file" ref="avatarFile" class="d-none" @change="bindAvatar">
                            </div>
                        </div>
                        <div class="form-group row " @click="settingProfile('username')">
                            <label class="col-form-label d-flex align-items-center col-3">{{lang.username}}</label>
                            <div class="input-group d-flex align-items-center justify-content-end col-9 pl-0">
                                <span>{{my.username}}</span>
                                <span class=" pl-2">&nbsp;</span>
                            </div>
                        </div>
                        <div class="form-group row " @click="settingProfile('name')">
                            <label class="col-form-label d-flex align-items-center col-3">{{lang.name}}</label>
                            <div class="input-group d-flex align-items-center justify-content-end col-9 pl-0">
                                <span>{{my.name}}</span>
                                <span class="ion-chevron-right pl-2"></span>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-form-label col-3">{{lang.residence}}</label>
                            <div class="input-group d-flex align-items-center justify-content-end col-9 pl-0">
                                <span class="flex-grow-1 text-right" @click="settingProfile('residence')" v-bind:class="my.residence === ''?'text-muted':''">{{my.residence === ''?lang.please_input_residence:my.residence}}</span>
                                <div class="pl-2 d-flex align-items-center" @click="bindLocation"><i class="ion-location"></i>&nbsp; <span class="font-size-12">{{ lang.bind_location}}</span> </div>
                            </div>
                        </div>
                        <div class="form-group row" @click="settingProfile('address')">
                            <label class="col-form-label col-3">{{lang.address}}</label>
                            <div class="input-group d-flex align-items-center justify-content-end col-9 pl-0">
                                <div style="width: calc( 100% - 50px)" class="flex-grow-1 text-right"><span class="font-size-14">{{my.address}}</span></div>
                                <div><span class="ion-chevron-right pl-2"></span></div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-light btn-block" @click="logOut">{{ lang.log_out}}</button>
                    </div>
                </div>
            </div>
            <div class="position-absolute residence-wrapper d-flex flex-column"
                 v-bind:class="bindResidence?'active':''">
                <div class="flex-grow-1"></div>
                <div class="px-2 bg-white">
                    <div class="d-flex justify-content-between pt-2 mb-3">
                        <button @click="bindResidence = false" class="btn btn-outline-dark btn-sm px-3">
                            {{lang.cancel}}
                        </button>
                        <button @click="saveResidence" class="btn btn-outline-success btn-sm px-3">{{lang.decide}}
                        </button>
                    </div>
                    <div class="d-flex justify-content-between">
                        <scroll-picker :options="parentResidences" v-model="temp.province_id"></scroll-picker>
                        <scroll-picker :options="childResidences" v-model="temp.city_id"></scroll-picker>
                    </div>

                </div>
            </div>
            <div class="position-absolute residence-wrapper d-flex flex-column" v-bind:class="bindExtra?'active':''">
                <div class="flex-grow-1"></div>
                <div class="px-2 bg-white">
                    <div class="d-flex justify-content-between pt-2 mb-3">
                        <button @click="bindExtra = false" class="btn btn-outline-dark btn-sm px-3">
                            {{lang.cancel}}
                        </button>
                        <button @click="saveExtraField" class="btn btn-outline-success btn-sm px-3">{{lang.decide}}
                        </button>
                    </div>
                    <div class="form-group pb-3 pt-2">
                        <div class="input-group extra-field-clear position-relative">
                            <input class="form-control form-control-lg" v-model="temp.extra_field">
                            <span v-if="temp.extra_field !== ''" class="position-absolute text-danger " @click="temp.extra_field = ''"><i
                                    class="fa fa-times-circle"></i> </span>
                        </div>

                    </div>

                </div>
            </div>
            <div class="position-absolute residence-wrapper profile-wrapper d-flex flex-column"
                 v-bind:class="bindProfile?'active':''">
                <div class="flex-grow-1"></div>
                <div class="px-2">
                    <div class="d-flex flex-column pt-2 mb-3">
                        <div class="bg-white mb-1">
                            <button @click="uploadByCamera" class="btn btn-light btn-block">
                                {{lang.upload_by_camera}}
                            </button>
                            <div class="line w-100"></div>
                            <button @click="uploadByLocal" class="btn btn-light btn-block mt-0">
                                {{lang.upload_from_local}}
                            </button>
                        </div>
                        <button @click="bindProfile = false" class="btn btn-light btn-block">
                            {{lang.cancel}}
                        </button>
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
    import {getResponseErrorMsg, deviceReady, requestSend, imageToBlob} from "@/js/common";
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
                my: {},
                bindResidence: false,
                bindExtra: false,
                bindProfile: false,
                bindingField: '',
                bindingLocation:false,
                detectedGeolocation:'',
                detectedGeoData:null,
                places:[],
                detectingGeoData:false,
                detectedGeoValue:null,
                setting:null,
                temp: {
                    province_id: 0,
                    city_id: 0,
                    extra_field: ''
                },
                residences: [],
                parentResidences: [],
                childResidences: [],
                rules: {
                    'phone': ['required', 'phone'],
                    'name': ['required'],
                    'residence': ['required'],
                    'address': ['required'],
                }
            }
        },
        created() {
            this.lang = locale;
            this.setting = config;
            const me = localStorage.getItem('me');
            if (me !== null && me !== '')
                this.my = JSON.parse(me);
            else
                router.push('/login');
            if (this.my.avatar === null)
                this.my.avatar = constants.ERR_SRC;
            this.getResidence();
            this.my.residence = this.getResidenceName(this.my.province_id, this.my.city_id);
            self = this
        },
        methods: {
            logOut() {
                localStorage.removeItem('token');
                localStorage.removeItem('me');
                router.push('/login')
            },
            setAltImg(event) {
                event.target.src = constants.ERR_SRC
            },
            settingProfile(field) {
                
                if (field === 'username') {
                    this.$ons.notification.toast(locale.username_disabled_edit, {timeout: 1000});
                } else if (field === 'residence') {
                    this.temp.province_id = this.my.province_id
                    this.temp.city_id = this.my.city_id
                    this.bindResidence = true
                } else if (field === 'avatar') {
                    this.bindProfile = true;
                } else {
                    this.bindExtra = true;
                    this.bindingField = field;
                    this.temp.extra_field = this.my[field];
                }
            },
            uploadByCamera() {
                this.bindProfile = false
                deviceReady().then((resp => {
                    if(resp.status) {
                        let blob = imageToBlob(resp.data);
                        let data = new FormData();
                        data.append('upload', blob);
                        this.bindProfile = false;
                        this.saveAvatar(data)
                    }

                }))
            },
            uploadByLocal() {
                this.$refs.avatarFile.click()
            },
            bindAvatar(evt) {
                let data = new FormData();
                data.append('upload', evt.target.files[0], evt.target.files[0].data);
                this.bindProfile = false;
                this.saveAvatar(data)
            },
            saveAvatar(params) {
                this.loading = true;
                requestSend(config.API_URL + 'save-avatar', params).then((resp => {
                    this.loading = false;
                    if (resp.status === constants.RES_SUCCESS) {
                        this.my.avatar = resp.result;
                        localStorage.setItem('me', JSON.stringify(this.my))
                    } else {
                        this.$ons.notification.alert(locale.INVALID_PARAM,{title:locale.alert_title,buttonLabel:locale.alert_ok});
                    }
                }));
            },
            saveProfile() {
                this.loading = true;
                requestSend(config.API_URL + 'change-profile', this.my).then((resp => {
                    this.loading = false;
                    if (resp.status === constants.RES_SUCCESS) {
                        localStorage.setItem('me', JSON.stringify(resp.result))
                    }
                }));
            },
            saveResidence() {
                this.my.province_id = this.temp.province_id;
                this.my.city_id = this.temp.city_id;
                this.my.residence = this.getResidenceName(this.my.province_id, this.my.city_id);
                this.bindResidence = false;
                this.saveProfile()
            },
            saveExtraField() {
                if (this.temp.extra_field === '') {
                    let errorMsg = locale.is_mandatory;
                    this.$ons.notification.toast(errorMsg, {timeout: 1000});
                } else {
                    this.my[this.bindingField] = this.temp.extra_field;
                    this.bindExtra = false;
                    this.saveProfile()
                }
            },
            getResidence() {
                const residence = localStorage.getItem('residence')
                if (residence === null) {
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
            getResidenceName(province, city,onlyCity = false) {
                let name = '';
                const parent = this.residences.filter(val => val.id === province);
                if (parent.length > 0) {
                    name += parent[0].name;
                    const child = parent[0].child.filter(val => val.id === city)
                    if (child.length > 0) {
                        if(onlyCity)
                            return child[0].name;
                        name += ' ' + child[0].name
                    }

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
                    let center = null;

                    if(self.my.geodata !== undefined && self.my.geodata !== null && JSON.parse(self.my.geodata).length === 2) {
                        center = JSON.parse(self.my.geodata);
                        map = new AMap.Map('map_root', {
                            zoom:13,
                            center : new AMap.LngLat(center[0],center[1])
                        });
                    } else {
                        map = new AMap.Map('map_root', {
                            zoom:13,
                        });
                    }
                    map.on('moveend',(e => {
                        let p1 = map.getCenter();
                        self.geocoder(p1.getLng(),p1.getLat()).then(data => {
                            if(data.status) {
                                self.detectedGeolocation = data.result.formattedAddress;
                                self.detectedGeoData = data.result;
                                self.detectedGeoValue =[p1.getLng(),p1.getLat()];
                                self.placeSearchPoint();
                            }
                        })
                    }));

                    /*map.on('click',(e => {
                        if (!marker) {
                            marker = new AMap.Marker({ map: map })
                        }
                        marker.setPosition([e.lnglat.getLng(), e.lnglat.getLat()])
                        self.geocoder(e.lnglat.getLng(), e.lnglat.getLat()).then(data => {
                            if(data.status) {
                                self.detectedGeolocation = data.result.formattedAddress;
                                self.detectedGeoData = data.result;
                                self.detectedGeoValue = [e.lnglat.getLng(), e.lnglat.getLat()];
                                self.placeSearchPoint();
                            }
                        })
                    }));*/

                    if(self.my.geodata !== undefined && self.my.geodata !== null && JSON.parse(self.my.geodata).length === 2) {
                        self.placeSearchPoint(true);
                    } else {
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
                                self.geocoder(data.position.getLng(), data.position.getLat(), data.addressComponent.citycode).then(geoLoc => {
                                    if(geoLoc.status) {
                                        self.detectedGeolocation = geoLoc.result.formattedAddress;
                                        self.detectedGeoData = geoLoc.result;
                                        self.detectedGeoValue = [data.position.getLng(), data.position.getLat()];
                                        self.placeSearchPoint();
                                    }

                                })
                            }));

                            AMap.event.addListener(geolocation, 'error', (data => {
                                self.$ons.notification.alert('获取定位信息失败！',{title:locale.alert_title,buttonLabel:locale.alert_ok});
                            }));

                        });
                    }

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
                    console.log(this.detectedGeoData);
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
                            this.my.province_id = residence[0].id;
                            this.my.city_id = city[0].id;
                            this.my.residence = this.getResidenceName(this.my.province_id,this.my.city_id);
                            this.my.address = address;
                            this.my.geodata = JSON.stringify(this.detectedGeoValue);
                            this.saveProfile();
                            this.bindingLocation = false;
                        }
                    }
                } else {
                    this.my.address = address;
                    this.my.geodata = JSON.stringify(this.detectedGeoValue);
                    this.saveProfile();
                    this.bindingLocation = false;
                }
            }
        },
        watch: {
            'temp.province_id': function (newVal) {
                const residence = this.residences.filter(val => val.id === newVal)
                if (residence.length > 0) {
                    this.childResidences = residence[0].child.map(function (val) {
                        return {'value': val.id, 'name': val.name}
                    })
                }
            }
        }
    }
</script>
