import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
     <footer className="px-6  md:px-16 lg:px-36  mt-40 w-full text-gray-300">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
                <div className="md:max-w-96">
                    <img className="w-36 h-auto" src={assets.logo} alt="logo" />
                    <p className="mt-6 text-sm">
                        Quick Show is a modern movie ticket booking platform that brings the latest films right to your fingertips. Browse trailers, explore featured titles, and easily book tickets — all in a fast, sleek, and user-friendly interface. Whether you're planning a night out or catching up on what's trending, Quick Show makes the experience quick and seamless.
</p>
                    
                    <div className="flex items-center gap-2 mt-4">
                        <a href="https://play.google.com" target='_blank'>                        
                        <img src={assets.googlePlay} alt="google play" className="h-9 w-auto " />
</a>
                    <a href="https://www.apple.com/app-store/" target='_blank'>    
                      <img src= {assets.appStore} alt="app store" className="h-9 w-auto" /></a>
                    </div>
                </div>
                <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
                    <div>
                        <h2 className="font-semibold mb-5">Company</h2>
                        <ul className="text-sm space-y-2">
                            <li><a href="#">Home</a></li>
                            <li><a href="#">About us</a></li>
                            <li><a href="#">Contact us</a></li>
                            <li><a href="#">Privacy policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-5">Get in touch</h2>
                        <div className="text-sm space-y-2">
                            <p>+1-234-567-890</p>
                            <p>contact@example.com</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-sm pb-5">
                Copyright {new Date().getFullYear()} &copy; PoojaDwivedi. All Right Reserved.
            </p>
        </footer>
  )
}

export default Footer
