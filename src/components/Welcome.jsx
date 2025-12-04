import {useRef} from "react";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";




const FONT_Weight = {
    subTitle: {min: 100, max: 400,default:100},
    title: {min: 400, max: 900, default: 400},
}

const renderText = (text, className, baseWeight = 400) => {
    return [...text].map((char, idx) => (
        <span
            key={idx}
            className={className}
            style={{
                fontVariationSettings: `'wght' ${baseWeight}`,
                display: 'inline-block',
                willChange: 'transform, color, text-shadow, font-variation-settings'
            }}
        >
            {char === ' ' ? "\u00a0" : char}
        </span>
    ))
}

const textHover = (container, type) => {
    if (!container) return () => {}
    const letters = container.querySelectorAll('span')
    const { min, max, default: base } = FONT_Weight[type]

    // Tunables per type for the pop-out effect
    const maxScale = type === 'title' ? 1.25 : 1.15
    const maxLift = type === 'title' ? -6 : -4 // y in px (negative goes up)
    const colorA = '#1f7aff'
    const colorB = '#ff4dd2'

    const lerp = (a, b, t) => a + (b - a) * t
    const lerpColor = (c1, c2, t) => {
        const p = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
        const [r1, g1, b1] = p(c1)
        const [r2, g2, b2] = p(c2)
        const r = Math.round(lerp(r1, r2, 0.5))
        const g = Math.round(lerp(g1, g2, 0.5))
        const b = Math.round(lerp(b1, b2, 0.5))
        return `rgb(${r}, ${g}, ${b})`
    }

    let enterTl = null
    let leaveTl = null

    const handleMouseEnter = () => {
        // cancel leave animation if running
        if (leaveTl) {
            leaveTl.kill()
            leaveTl = null
        }

        // slight overall lift on container entrance
        gsap.to(container, { duration: 0.25, y: -1, ease: 'power1.out' })

        // one-by-one pop out
        enterTl = gsap.timeline({ defaults: { ease: 'power2.out' } })
        enterTl.to(letters, {
            duration: 0.22,
            overwrite: 'auto',
            fontVariationSettings: `'wght' ${max}`,
            scale: maxScale,
            y: maxLift,
            color: lerpColor(colorA, colorB, 0.5),
            textShadow: `0 2px 6px rgba(0,0,0,0.15)`,
            stagger: 0.03
        })
    }

    const handleMouseLeave = () => {
        if (enterTl) {
            enterTl.kill()
            enterTl = null
        }
        gsap.to(container, { duration: 0.25, y: 0, ease: 'power1.inOut' })

        // gracefully reset letters one-by-one in reverse order
        leaveTl = gsap.timeline({ defaults: { ease: 'power1.inOut' } })
        leaveTl.to([...letters].reverse(), {
            duration: 0.22,
            overwrite: 'auto',
            fontVariationSettings: `'wght' ${base}`,
            scale: 1,
            y: 0,
            color: '',
            textShadow: 'none',
            stagger: 0.02
        })
    }

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mouseleave', handleMouseLeave)
    }
}



const Welcome = () => {
    const titleRef= useRef(null);
    const subtitleRef = useRef(null);
    const hireRef = useRef(null);

    useGSAP(()=>{
       gsap.registerPlugin(ScrollTrigger);

       const titleClean= textHover(titleRef.current,'title')
       const subTitleClean = textHover(subtitleRef.current,'subTitle')

       // Scroll-triggered "Hire me" pop-out: left group then right group (random within each), then fade away
       const container = hireRef.current;
       let cleanupHire = () => {};
       if (container) {
           const letters = container.querySelectorAll('span');
           const { max, default: base } = FONT_Weight.title;

           // Build groups by index: left = even, right = odd
           const all = Array.from(letters);
           const leftGroup = all.filter((_, i) => i % 2 === 0);
           const rightGroup = all.filter((_, i) => i % 2 === 1);

           // Randomize order within each group
           const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);
           const leftOrder = shuffle(leftGroup);
           const rightOrder = shuffle(rightGroup);

           const tl = gsap.timeline({
               defaults: { ease: 'power2.out' },
               scrollTrigger: {
                   trigger: container,
                   start: 'top 85%',
                   once: true,
               }
           });

           // Ensure starting state
           gsap.set(all, { opacity: 0, y: 0, x: 0, scale: 1, fontVariationSettings: `'wght' ${base}` });

           const popDuration = 0.22;
           const fadeDuration = 0.3;
           const maxScale = 1.2;
           const lift = -6;

           // Left group pops in from left
           tl.fromTo(leftOrder,
               { opacity: 0, x: -40, scale: 0.95 },
               {
                   duration: popDuration,
                   opacity: 1,
                   x: 0,
                   scale: maxScale,
                   y: lift,
                   fontVariationSettings: `'wght' ${max}`,
                   stagger: { each: 0.06 }
               }
           );

           // Then right group pops in from right (random order)
           tl.fromTo(rightOrder,
               { opacity: 0, x: 40, scale: 0.95 },
               {
                   duration: popDuration,
                   opacity: 1,
                   x: 0,
                   scale: maxScale,
                   y: lift,
                   fontVariationSettings: `'wght' ${max}`,
                   stagger: { each: 0.06 }
               },
               '>-0.05' // slight overlap with left finishing
           );

           // Fade away all letters after a brief hold
           tl.to(all, {
               duration: fadeDuration,
               opacity: 0,
               y: 20,
               scale: 1,
               fontVariationSettings: `'wght' ${base}`,
               stagger: 0.02
           }, '+=0.2');

           cleanupHire = () => {
               tl.kill();
               if (tl.scrollTrigger) tl.scrollTrigger.kill();
           }
       }

        return () => {
           titleClean();
           subTitleClean();
           cleanupHire();
        }

    },[])

    return (
        <section id='welcome'>
            <p ref={subtitleRef}>{renderText("hey, I'm Badre! Welcome to my",'tex3xl font-georama',100)}</p>
            <h1 ref={titleRef} className='mt-7'>{renderText("portfolio","text-5xl italic font-georama") }</h1>

            <p ref={hireRef} className='mt-10 text-4xl font-georama'>
                {renderText("Hire me","inline-block")}
            </p>

            <div className={'small-screen'}>
                <p className={'text-black/60'}>Design for Desktop/Tablet screens only</p>
            </div>
        </section>
    )
}
export default Welcome
