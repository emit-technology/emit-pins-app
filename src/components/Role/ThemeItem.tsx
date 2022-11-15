import * as React from 'react';
import {TribeRole, TribeTheme} from "../../types";
import {IonAvatar} from '@ionic/react';
import {utils} from "../../common";

interface Props{
    theme: TribeTheme;
    roles: Array<TribeRole>;
    seq: number;
}
export const ThemeItem:React.FC<Props> = ({theme,roles,seq}) =>{

    const roleImgs:Array<string>=[];
    if(roles){
        for(let i=0;i<roles.length;i++){
            if(i>3 && roles.length>4){
                roleImgs.push(`${roles.length - 4}`)
                break;
            }else{
                roleImgs.push(utils.getDisPlayUrl(roles[i].avatar))
            }
        }
    }
    return <>
        <div style={{padding: '8px 20px', height: 180 ,position: "relative"}}>
            {theme && <div style={{position:"relative",width:'100%',height:'100%',backgroundImage: `url(${utils.getDisPlayUrl(theme.image)})`}} className="theme-img">
                {/*<img src={theme.image} className="theme-img"/>*/}
                <div className="pinned-img-shade"></div>
            </div>}

             <div className="pinned-msg-title">
                 {seq> 0 && `#${seq}`}
                 <div>{theme.themeTag}</div>
                 <div><small>{theme.themeDesc}</small></div>
             </div>

            {
                roleImgs && roleImgs.length > 0 && roleImgs.map((img,i)=>{
                    if(i >=4){
                        return <div key={i} className="pinned-msg-roles pinned-msg-rolesi">
                            +{roleImgs[i]}
                        </div>
                    }
                    return <div key={i} className="pinned-msg-roles" style={{right: 20 + (i+1)*22,zIndex: 10000 - i*2 }}>
                        <IonAvatar className="ion-avatar2">
                            <img src={img} />
                        </IonAvatar>
                    </div>
                })
            }
        </div>
    </>
}