import * as React from 'react';
import { OverlayScrollbarsComponent , useOverlayScrollbars } from "overlayscrollbars-react";
import {useEffect, useRef} from "react";
import { useParallax , Parallax} from 'react-scroll-parallax';
// do not inline the component, as a fresh instance would be created with each re-render
// if you need to do some conditional logic, use Virtuoso's context prop to pass props inside the Scroller
//@ts-ignore
export const VirtuosoScroller = React.forwardRef(({ style, ...props }, ref) => {
    // an alternative option to assign the ref is
    // <div ref={(r) => ref.current = r}>LazyLoadImage
    //@ts-ignore

    // const { refEx } = useParallax<HTMLDivElement>({ speed: 10 });
//@ts-ignore
    return  <div  style={{ ...style }} className="customer-scroll" {...props} ref={(r) => ref.current = r} />
})


export const VirtuosoScroller1 = () => {
    const ref = useRef();
    const [initialize, instance, ] = useOverlayScrollbars({  });

    useEffect(() => {
        initialize(ref.current);
    }, [initialize]);

    return <div ref={ref} />
}