import { useEffect, useState, useRef } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"
import { AiOutlineMenuFold } from "react-icons/ai";
import { AiOutlineMenuUnfold } from "react-icons/ai";

import logo from "../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { apiConnector } from "../../services/apiConnector"
import { categories } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropdown"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { logout } from "../../services/operations/authAPI"
import { useDispatch} from "react-redux"
import { useNavigate } from "react-router-dom"
import useOnClickOutside from "../../hooks/useOnClickOutside"


// const subLinks = [
//   {
//     title: "Python",
//     link: "/catalog/python",
//   },
//   {
//     title: "javascript",
//     link: "/catalog/javascript",
//   },
//   {
//     title: "web-development",
//     link: "/catalog/web-development",
//   },
//   {
//     title: "Android Development",
//     link: "/catalog/Android Development",
//   },
// ];

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const ref = useRef(null)

  useOnClickOutside(ref, () => setOpen(false))

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  useEffect(()=>{
    setOpen(false);
  }, []);

  console.log("sub links", subLinks)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const handleMenuClick = () => {
    setOpen(true);
  }

  const handleMenuClose = () => {
    setOpen(false);
  }

  return (
    <div
      className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== "/" ? "bg-richblack-800" : ""
      } transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>
        {/* Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : subLinks?.length ? (
                          <>
                            {subLinks
                              ?.filter(
                                (subLink) => subLink?.courses?.length > 0 
                              )
                              ?.map((subLink, i) => (
                                <Link
                                  to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                  key={i}
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))}
                          </>
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {/* Login / Signup / Dashboard */}
        <div className="hidden items-center gap-x-4 md:flex">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <Link to="/login">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Log in
              </button>
            </Link>
          )}
          {token === null && (
            <Link to="/signup">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropdown />}
        </div>

        <button className={`mr-4 md:hidden ${open ? "hidden" : "block"}`}>
          <AiOutlineMenuFold fontSize={24} fill="#AFB2BF" onClick={handleMenuClick}/>
        </button>
          
        <div className={`fixed py-4 px-4 h-full md:hidden w-6/12 z-[1000] items-center gap-x-4 top-0 right-0 bg-richblack-900 w-30 ${open ? "block" : "hidden"}`} 
        ref={ref}>

          <div className="flex items-center justify-between">
            <button className="pb-4">
              <AiOutlineMenuUnfold fontSize={24} fill="#AFB2BF" onClick={handleMenuClose}/>
            </button>

            {token !== null && <div>
              <img
                src={user?.image}
                alt={`profile-${user?.firstName}`}
                className="aspect-square w-[40px] rounded-full object-cover"
              />
            </div>}

            
          </div>
          
          <div className="flex flex-col gap-2 py-4 text-blue-300">
            <Link to="/" onClick={handleMenuClose}>
              <div>Home</div>
            </Link>

            <Link to="/about" onClick={handleMenuClose}>
              <div>AboutUs</div>
            </Link>

            <Link to="/contact" onClick={handleMenuClose}>
              <div>ContactUs</div>
            </Link>

          </div>

          <div className="flex gap-2 flex-col">
            {
              user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                <div className="overflow-hidden mr-4 rounded-md border-[1px] border-richblack-700 bg-richblack-800">
                  <Link to="/catalog/web-dev" onClick={handleMenuClose}>
                    <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25">
                    Courses
                    </div>
                  </Link>
                </div>
              )
            }

            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <div className="overflow-hidden mr-4 rounded-md border-[1px] border-richblack-700 bg-richblack-800">
              <Link to="/dashboard/cart" className="relative" onClick={handleMenuClose}>
                <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25">
                  <AiOutlineShoppingCart className="text-xl text-richblack-100" />
                  cart
                </div>
              </Link>
              </div>
            )}
            <div className="flex gap-4">
              {token === null && (
                <Link to="/login" onClick={handleMenuClose} className="text-lg">
                  <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[6px] py-[3px] text-richblack-100">
                    Log in
                  </button>
                </Link>
              )}
              {token === null && (
                <Link to="/signup" onClick={handleMenuClose} className="text-lg">
                  <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[6px] py-[3px] text-richblack-100">
                    Sign up
                  </button>
                </Link>
              )}
            </div>
            
            {token !== null && <div>
              <div
                onClick={(e) => e.stopPropagation()}
                className="overflow-hidden mr-4 rounded-md border-[1px] border-richblack-700 bg-richblack-800"
              >
                <Link to="/dashboard/my-profile" onClick={() => setOpen(false)}>
                  <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25">
                    <VscDashboard className="text-lg" />
                    Dashboard
                  </div>
                </Link>
                <div
                  onClick={() => {
                    dispatch(logout(navigate))
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25"
                >
                  <VscSignOut className="text-lg" />
                  Logout
                </div>
              </div>

            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
