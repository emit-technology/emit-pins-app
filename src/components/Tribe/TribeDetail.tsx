import * as React from 'react';

import {IonModal, IonPage, IonContent, createAnimation, Gesture, createGesture} from '@ionic/react';
import {DashboardV2} from "../../pages/Dashboard/index2";
import {useCallback, useEffect, useMemo} from "react";
import {utils} from "../../common";

interface Props {
    tribeId: string;
    isOpen: boolean;
    onClose: () => void;
}


export const TribeDetail: React.FC<Props> = ({tribeId, isOpen, onClose}) => {

    useEffect(() => {
        if (utils.isApp()) {
            const gesture: Gesture = createGesture({
                el: document.querySelector('.tribe-detail-dom'),
                threshold: 100,
                direction: "x",
                disableScroll: true,
                gestureName: 'my-gesture',
                onEnd: ev => {
                    if (ev.deltaX >= Math.ceil(document.documentElement.clientWidth * 0.4)) {
                        onClose();
                        setImmediate(()=>{
                            //@ts-ignore
                            document.querySelector('.tribe-detail-dom').style.transform = `translateX(0px)`
                        })
                    } else {
                        //@ts-ignore
                        document.querySelector('.tribe-detail-dom').style.transform = `translateX(0px)`
                    }
                },
                onMove: ev => {
                    //@ts-ignore
                    document.querySelector('.tribe-detail-dom').style.transform = `translateX(${Math.abs(ev.deltaX)}px)`
                }
            });
            gesture.enable();
        }
    }, [])

    const enterAnimation = useCallback((baseEl: HTMLElement) => {
        const root = baseEl.shadowRoot;

        const backdropAnimation = createAnimation()
            .addElement(root?.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(root?.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: 0.1, transform: 'translateX(100%)' },
                { offset: 1, opacity: 1, transform: 'translateX(0%)' },
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(300)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    },[]);

    const leaveAnimation = useCallback((baseEl: HTMLElement) => {
        return enterAnimation(baseEl).direction('reverse');
    },[]);

    return <>
        {/*<IonModal keepContentsMounted isOpen={isOpen} onDidDismiss={()=>onClose()} className="tribe-detail-modal"*/}
        {/*          enterAnimation={enterAnimation}*/}
        {/*          leaveAnimation={leaveAnimation}*/}
        {/*>*/}
        {/*    <IonContent>*/}
        {/*        <DashboardV2 tribeId={tribeId} router={null} isDetailModal={isOpen}/>*/}
        {/*    </IonContent>*/}
        {/*</IonModal>*/}

        <div className="tribe-detail-dom" style={{display: isOpen?"block":"none"}}>
            <IonContent>
                <DashboardV2 tribeId={tribeId} router={null} isDetailModal={true} isOpenDetail={isOpen}/>
            </IonContent>
        </div>
    </>
}