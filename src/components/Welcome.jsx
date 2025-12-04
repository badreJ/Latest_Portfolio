import {useRef} from "react";
import gsap from "gsap";
import {useGSAP} from "@gsap/react";




const FONT_Weight = {
    subTitle: {min: 100, max: 400,default:100},
    title: {min: 400, max: 900, default: 400},
}

const renderText = (text,className,baseWeight=400) => {
    return [...text].map((char,idx) =>(
        <span key={idx} className={className} style={{fontVariationSettings:`'wght' ${baseWeight}`}}>
            {char === ' '? "\u00a0" : char}
        </span>
    ))

}

const textHover= (container,type) => {
    if(!container) return
    const letter= container.querySelectorAll('span')
    const {min,max,default:base} = FONT_Weight[type]
    const animateLetter =(letter,weight,duration=0.25)=>{
        return gsap.to(letter, {
            duration,
            ease: "power1.inOut",
            fontVariationSettings:`'wght' ${weight}`,


        })
    }

    const handleMouseMove = (e) => {

        const {left} = container.getBoundingClientRect();
        const mouseX = e.clientX - left

        letter.forEach((letter) =>{
            const {left:l, width:w} = container.getBoundingClientRect();
            const distance = Math.abs(mouseX - (l - left + w/2))
            // const distance = Math.abs(mouseX - (l-left+w/2))
            const intensity = Math.exp(-(distance ** 2) / 20000)

            animateLetter(letter,min + (max-min) * intensity)
        })
    }
    const handleMouseLeave = () => {
        letter.forEach((letter) => animateLetter(letter,base,0.3))
    }
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
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

            <div className='small-screen'>
                <p className='text-black/60'>Design for Desktop/Tabled screens only</p>
            </div>
        </section>
    )
}
export default Welcome
