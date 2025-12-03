import {useRef} from "react";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";




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

    // Tunables per type
    const falloff = type === 'title' ? 12000 : 18000 // bigger = softer spread
    const maxScale = type === 'title' ? 1.25 : 1.15
    const maxLift = type === 'title' ? -6 : -4 // y in px (negative goes up)

    const lerp = (a, b, t) => a + (b - a) * t
    const lerpColor = (c1, c2, t) => {
        const p = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
        const [r1, g1, b1] = p(c1)
        const [r2, g2, b2] = p(c2)
        const r = Math.round(lerp(r1, r2, t))
        const g = Math.round(lerp(g1, g2, t))
        const b = Math.round(lerp(b1, b2, t))
        return `rgb(${r}, ${g}, ${b})`
    }

    const colorA = '#1f7aff' // start accent
    const colorB = '#ff4dd2' // end accent

    const animateLetter = (el, weight, intensity, duration = 0.25) => {
        return gsap.to(el, {
            duration,
            ease: 'power2.out',
            overwrite: 'auto',
            fontVariationSettings: `'wght' ${weight}`,
            scale: 1 + (maxScale - 1) * intensity,
            y: maxLift * intensity,
            color: lerpColor('#222222', lerpColor(colorA, colorB, intensity), intensity * 0.9),
            textShadow: `0 2px 6px rgba(0,0,0,${0.15 * intensity})`
        })
    }

    const handleMouseMove = (e) => {
        const { left } = container.getBoundingClientRect()
        const mouseX = e.clientX - left

        letters.forEach((el) => {
            const rect = el.getBoundingClientRect()
            const centerX = rect.left - left + rect.width / 2
            const distance = Math.abs(mouseX - centerX)
            const intensity = Math.exp(-(distance ** 2) / falloff)
            const weight = min + (max - min) * intensity
            animateLetter(el, weight, intensity)
        })
    }

    const handleMouseEnter = () => {
        // slight overall lift on container entrance
        gsap.to(container, { duration: 0.3, y: -1, ease: 'power1.out' })
    }

    const handleMouseLeave = () => {
        gsap.to(container, { duration: 0.3, y: 0, ease: 'power1.inOut' })
        letters.forEach((el) =>
            gsap.to(el, {
                duration: 0.35,
                ease: 'power1.inOut',
                overwrite: 'auto',
                fontVariationSettings: `'wght' ${base}`,
                scale: 1,
                y: 0,
                color: '',
                textShadow: 'none'
            })
        )
    }

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
    }
}



const Welcome = () => {
    const titleRef= useRef(null);
    const subtitleRef = useRef(null);

    useGSAP(()=>{
       const titleClean= textHover(titleRef.current,'title')
       const subTitleClean = textHover(subtitleRef.current,'subTitle')

        return () => {
           titleClean();
           subTitleClean();
        }

    },[])

    return (
        <section id='welcome'>
            <p ref={subtitleRef}>{renderText("hey, I'm Badre! Welcome to my",'tex3xl font-georama',100)}</p>
            <h1 ref={titleRef} className='mt-7'>{renderText("portfolio","text-5xl italic font-georama") }</h1>

            <div className={'small-screen'}>
                <p className={'text-black/60'}>Design for Desktop/Tablet screens only</p>
            </div>
        </section>
    )
}
export default Welcome
