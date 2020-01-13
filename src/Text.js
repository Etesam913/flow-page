import React, { useState, useEffect, useRef } from 'react';
import { motion, useTransform, useMotionValue, useAnimation } from 'framer-motion';
import styled from 'styled-components';
import './App.css';
import trashcan from './images/trashcan.png';
import { removePropertiesDeep } from '@babel/types';

const TextArea = styled(motion.input)`
  font-weight: bold;
  font-family: "Roboto";
  font-size: 3rem;
  text-align: center;
  border-top: none; border-left: none; border-right: none; border-bottom: none;
  background-color: #fff0;
`;
const Component = styled(motion.div)`
    position: absolute;
    left: 35%;
    top: 35%;
    display: flex;
    flex-direction: column;
    width: 40rem;
`;
function Text(props) {
   const [hover, setHover] = useState(false);
   const [deleted, setDeleted] = useState(false);
   const [scaleSlider, setScaleSlider] = useState(false);
   const textInput = useRef(null);
   const component = useRef(null);
   // Animation
   const controls = useAnimation();
   let x = useMotionValue(getScalePos());
   const motionRange = [-70, 0, 70];
   const scaleRange = [.25, 1, 1.75];
   let scale = useTransform(x, motionRange, scaleRange);
   
   useEffect(()=>{
      textInput.current.value = localStorage.getItem("text" + props.test);
   }, [])
   useEffect(()=>{
      localStorage.setItem("textElement", JSON.stringify(props.elements));
   }, [props.elements])
 
   function getElementIndex(identifier){
      for(let i = 0; i < props.elements.length; i++){
         //console.log(props.elements[i]);
         if(identifier === props.elements[i].id){
            return i;
         }
      }
      return -1;
   }
   function handleTrashing() {
      if (props.canEdit) {
         setDeleted(true);
         setScaleSlider(false);
         localStorage.setItem("text" + props.test,  "");
         localStorage.setItem("scalePosText" + props.test, "0");
         let modifiedArray = props.elements.slice(0, getElementIndex(props.test)).concat(props.elements.slice(getElementIndex(props.test) + 1, props.elements.length));
         console.log("identifier :" + props.test);
         //console.log("index: " + getElementIndex(props.identifier));
         console.log("Modified array : " + modifiedArray);
         props.onChange(modifiedArray);
      }
      else {
         return;
      }
   }
   function slidingDone(event, info){
      storeScale();
      setScaleSlider(false);
      console.log(info.point.x);
      localStorage.setItem("scalePosText" + props.test, info.point.x);
   }
   function getScalePos(){
      if(localStorage.getItem("scalePosText" + props.test) !== null){
         console.log(parseInt(localStorage.getItem("scalePosText" + props.test)));
         return parseInt(localStorage.getItem("scalePosText" + props.test));
      }
      else{
         return 0;
      }
   }
   function storeScale(){
      localStorage.setItem("scaleText" + props.test, scale.current);
      console.log(localStorage.getItem("scaleText" + props.test));
   }
 
   function getScale(){
      if(localStorage.getItem("scaleText" + props.test) !== null){
         console.log('yeet');
         return localStorage.getItem("scaleText" + props.test);
      }
      else{
         return .5;
      }
   }

   if (deleted) {
      return (
         <div></div>
      );
   }
   else {
      return (
         <Component ref={component} initial = {{opacity: 0}} animate={{opacity: 1}} style={{scale}} onHoverStart={() => { setHover(true) }} onHoverEnd={() => { setHover(false) }} drag={props.canEdit ? true : false} dragConstraints={{ left: -500, right: 500, top: -350, bottom: 475 }} dragTransition={{ bounceStiffness: 300, bounceDamping: 10 }}>
            <motion.div className="tools" initial={{ opacity: 0 }} animate={hover && props.canEdit ? { opacity: 1 } : { opacity: 0 }}>
               <div className="slider-container">
                  <div className="slider">
                     <motion.div className="handle" style={{ x }} drag={props.canEdit ? 'x' : false} dragConstraints={{ left: -70, right: 70 }} dragElastic={0} dragMomentum={false} onDragStart={() => {setScaleSlider(true)}}  onDragEnd={(event, info)=>{slidingDone(event, info)}}></motion.div>
                  </div>
               </div>
               <motion.img src={trashcan} className="delete-button" onClick={() => { handleTrashing() }} whileHover={{ scale: 1.15 }} whileTap={{ scale: .9 }}></motion.img>
            </motion.div>
            <TextArea ref = {textInput} onChange={(event)=>{localStorage.setItem("text" + props.test, event.target.value)}} placeholder="placeholder"></TextArea>
         </Component>
      );
   }
}
export default Text;