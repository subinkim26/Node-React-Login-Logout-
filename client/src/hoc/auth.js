//import axios from 'axios';
//import { response } from 'express';
import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {auth} from '../_actions/user_action';


export default function(SpecificComponent, option, adminRoute = null){

    //null -> 아무나 출입가능
    //true -> 로그인 유저만
    //false -> 로그인 유저 출입불가능

    function AuthenticationCheck(props) {

        const dispatch = useDispatch();

        useEffect(() => {
            dispatch(auth()).then(response =>{
                console.log(response)

                //로그인 x 상태
                if(!response.payload.isAuth){
                    if(option){
                        props.history.push('./login')
                    }

                }else{
                    //로그인 상태
                    if(adminRoute && !response.payload.isAdmin){
                        props.history.push('/')
                    }
                    else{
                        if(option === false){
                            props.history.push('/')
                        }
                    }
                }
            })

          
        }, [])


        return(
            <SpecificComponent />
        )

    }




    return AuthenticationCheck
}