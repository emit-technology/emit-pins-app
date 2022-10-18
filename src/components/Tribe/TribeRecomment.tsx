import * as React from 'react';
import {MsgText, TribeInfo, TribeRole} from "../../types";
import {
    IonCard, IonRow, IonCol,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonAvatar,
} from '@ionic/react'
import {utils} from "../../common";
import _ from "lodash";
import RGL, {WidthProvider} from "react-grid-layout";
import {useEffect, useState} from "react";

const ReactGridLayout = WidthProvider(RGL);



interface Props {
    data: Array<TribeInfo>
    layout: Array<any>
}

export const TribeRecommend: React.FC<Props> = ({data,layout}) => {

    // const [layout, setLayout] = useState([]);
    const defaultProps = {
        className: "layout",
        isDraggable: false,
        // isResizable: true,
        autoSize:true,
        items: data.length,
        cols: 12,
        // rowHeight: 50,
        onLayoutChange: (layout:any) => {
        }
    };
    // useEffect(() => {
    //     console.log(generateLayout(),"generateLayout()")
    //     setLayout(generateLayout());
    // }, [])

    // data = [...data, ...data, ...data]
    console.log(layout,"layout=======");
    const onLayoutChange = (layout) => {
        // defaultProps.onLayoutChange(layout);
    }


    return <>

        <ReactGridLayout
            layout={layout}
            onLayoutChange={onLayoutChange}
            {...defaultProps}
        >
            {
                data && data.map((v, i) => {
                    const content = v.latestMsg && v.latestMsg.content as MsgText;
                    const actor: TribeRole = v.roles.find(vr => vr.id == (v.latestMsg && v.latestMsg.role));
                    return <div key={i}>
                        <div className="recmt-content" onClick={() => {
                            window.location.href = `./${v.tribeId}`
                        }}>
                            <div className="recmt-head">
                                <div className="recmt-head-icon">
                                    <img src={utils.getDisPlayUrl(v.theme.image)}/>
                                </div>
                                <div className="recmt-head-title">
                                    <div>{v.title}</div>
                                    {/*<div>{v.theme.themeTag}</div>*/}
                                    <div>{v.tribeId}</div>
                                </div>
                            </div>
                            {
                                content && content["image"] && content["image"]["url"] &&
                                <div className="recmt-img">
                                    <img src={content["image"]["url"]}/>
                                </div>
                            }
                            {
                                content && content["content"] &&
                                <div className="recmt-context">
                                    {content["content"]}
                                    <div>
                                        <div></div>
                                    </div>
                                </div>
                            }

                            <div className="recmt-footer">
                                <div>
                                    {v.roles && v.roles.length} Roles
                                </div>
                                <div style={{display: "flex", alignItems: "center"}}>
                                    {actor && <>
                                        <div style={{
                                            padding: '0 6px',
                                            color: "#000",
                                            fontSize: '16px'
                                        }}>{actor.name}</div>
                                        <div>
                                            <img src={utils.getDisPlayUrl(actor.avatar)}/>
                                        </div>
                                    </>
                                    }
                                </div>
                            </div>

                        </div>
                    </div>
                })
            }
        </ReactGridLayout>


    </>
}