import {date, navIcons, navLinks,} from "#constants/index.js";
import {useState,useEffect} from "react";


const Navbar = () => {
    const [time, setTime] = useState(new Date());
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const seconds = time.getSeconds().toString().padStart(2, "0");

    useEffect(() => {
        let intervalId = setInterval(() => {
            setTime(new Date());
        },1000)
        return () => clearInterval(intervalId);
    },[])


    return (
        <nav>
            <div className='relative'>
                <img src="/images/logo.png" alt="logo"/>
                <p className="font-bold"> Badre's Portfolio</p>
                <ul>
                    {navLinks.map(item=><li key={item.id}>{item.name}</li>)}
                </ul>
            </div>
            <div >
                <ul>
                    {navIcons.map(item=><li key={item.id}>
                        <img src={item.img}  alt={`icon-${item.id}`}/>

                    </li>)}
                </ul>
                <div className='flex flex-col text-black/60'>
                    <p className='absolute top-0 '>{`${hours}:${minutes}:${seconds}`}</p>
                    <p>{date}</p>


                </div>

            </div>
        </nav>
    )
}
export default Navbar
