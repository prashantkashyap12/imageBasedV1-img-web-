import { useRef, useState, useEffect, useCallback } from "react";
import { NavLink as NavLinkRRD, Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import logoImg from "../../assets/img/brand/ios.png";
import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from "react-icons/io";
import { Nav, NavItem, NavLink, NavbarBrand } from "reactstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { useScan } from "../../context/ScanningContext";
import { toast } from "react-toastify";

const SIDEBAR_FULL = 250;
const SIDEBAR_COLLAPSED = 80;
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 992;

const getBreakpoint = () => {
  const w = window.innerWidth;
  if (w < MOBILE_BREAKPOINT) return "mobile";
  if (w < TABLET_BREAKPOINT) return "tablet";
  return "desktop";
};

const Sidebar = (props) => {
  const { routes, logo } = props;
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [breakpoint, setBreakpoint] = useState(getBreakpoint);

  const sidebarRef = useRef(null);
  const mouseDownTarget = useRef(null);

  const { isScanning } = useScan();

  const applyShift = useCallback((bp, isCollapsed) => {
    const width =
      bp === "mobile"
        ? 0
        : bp === "tablet"
          ? SIDEBAR_COLLAPSED
          : isCollapsed
            ? SIDEBAR_COLLAPSED
            : SIDEBAR_FULL;
    document.documentElement.style.setProperty("--sidebar-shift", `${width}px`);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const bp = getBreakpoint();
      setBreakpoint(bp);
      setCollapsed((prev) => {
        const next = bp === "tablet" ? true : bp === "desktop" ? false : prev;
        applyShift(bp, next);
        return next;
      });
      if (bp !== "mobile") setMobileOpen(false);
    };
    applyShift(getBreakpoint(), getBreakpoint() === "tablet");
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [applyShift]);

  useEffect(() => {
    applyShift(breakpoint, collapsed);
  }, [collapsed, breakpoint, applyShift]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Synchronize mobile state with body classes for Argon CSS compatibility
  useEffect(() => {
    if (breakpoint === "mobile") {
      if (mobileOpen) {
        document.body.classList.add("g-sidenav-pinned", "g-sidenav-show");
        document.body.style.overflow = "hidden";
      } else {
        document.body.classList.remove("g-sidenav-pinned", "g-sidenav-show");
        document.body.style.overflow = "";
      }
    }
    return () => {
      document.body.classList.remove("g-sidenav-pinned", "g-sidenav-show");
      document.body.style.overflow = "";
    };
  }, [mobileOpen, breakpoint]);

  // Close tablet sidebar on click outside
  useEffect(() => {
    const onMouseDown = (e) => {
      mouseDownTarget.current = e.target;
    };
    const onMouseUp = (e) => {
      if (!sidebarRef.current) return;
      const isOutside =
        !sidebarRef.current.contains(mouseDownTarget.current) &&
        !sidebarRef.current.contains(e.target);

      if (breakpoint === "tablet" && !collapsed && isOutside) {
        setCollapsed(true);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [breakpoint, collapsed]);

  const handleToggleCollapse = () => setCollapsed((c) => !c);

  const createLinks = (routes) => {
    const role = JSON.parse(localStorage.getItem("userData"))?.role;
    return routes
      ?.filter((r) => r.showInSidebar !== false)
      ?.filter((r) => !r.roleRequired || r.roleRequired === role)
      .map((route, index) => {
        const visibleChildren =
          route.children?.filter((c) => c.showInSidebar !== false) ?? [];
        const hasChildren = visibleChildren.length > 0;
        const isOpen = openMenu === index;
        const isCollapsedView = collapsed && breakpoint !== "mobile";

        return (
          <div key={index}>
            <NavItem>
              <NavLink
                to={hasChildren ? "#" : `${route.layout}${route.path}`}
                tag={NavLinkRRD}
                title={isCollapsedView ? route.name : undefined}
                className={`sidebar-nav-link${isCollapsedView ? " icon-only" : ""}`}
                onClick={(e) => {
                  if (isScanning) {
                    e.preventDefault();
                    toast.warn("Scanning in progress");
                    return;
                  }

                  if (hasChildren) {
                    e.preventDefault();
                    setOpenMenu(isOpen ? null : index);
                  }
                }}
              >
                <i className={`${route.icon} s-icon`} />
                {!isCollapsedView && (
                  <>
                    <span className="s-label">{route.name}</span>
                    {hasChildren && (
                      <i
                        className={`fa fa-chevron-${isOpen ? "up" : "down"} s-chevron`}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </NavItem>

            {hasChildren && isOpen && !isCollapsedView && (
              <div className="s-submenu">
                {visibleChildren.map((child, i) => (
                  <NavItem key={i}>
                    <NavLink
                      to={`${child.layout}${child.path}`}
                      tag={NavLinkRRD}
                      className="s-submenu-link"
                    >
                      {child.icon && <i className={`${child.icon} s-icon`} />}
                      <span>{child.name}</span>
                    </NavLink>
                  </NavItem>
                ))}
              </div>
            )}
          </div>
        );
      });
  };

  let brandProps = {};
  if (logo?.innerLink) brandProps = { to: logo.innerLink, tag: Link };
  else if (logo?.outterLink)
    brandProps = {
      href: logo.outterLink,
      target: "_blank",
      rel: "noopener noreferrer",
    };

  const isCollapsedView = collapsed && breakpoint !== "mobile";
  const isTabletExpanded = breakpoint === "tablet" && !collapsed;

  return (
    <>
      <style>{`
        :root {
          --sidebar-shift: ${SIDEBAR_FULL}px;
          --sb-transition: 0.25s ease;
        }

        .main-content {
          margin-left: var(--sidebar-shift) !important;
          transition: margin-left var(--sb-transition);
        }
        .navbar-top {
          left: var(--sidebar-shift) !important;
          width: calc(100% - var(--sidebar-shift)) !important;
          transition: left var(--sb-transition), width var(--sb-transition);
        }

        /* ── Base Sidebar ── */
        #sidenav-main {
          position: fixed !important;
          top: 0; left: 0; bottom: 0;
          height: 100vh !important;
          width: ${SIDEBAR_FULL}px;
          background: #fff;
          border-right: 1px solid #e9ecef;
          box-shadow: 2px 0 10px rgba(0,0,0,0.07);
          display: flex !important;
          flex-direction: column !important;
          overflow: visible !important;
          transition: transform var(--sb-transition), width var(--sb-transition);
          z-index: 1040;
        }
        #sidenav-main.is-collapsed {
          width: ${SIDEBAR_COLLAPSED}px;
        }

        /* ── Tablet ── */
        @media (min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px) {
          #sidenav-main { 
            width: ${SIDEBAR_COLLAPSED}px; 
            z-index: 1045;
          }
          #sidenav-main.is-tablet-expanded { 
            width: ${SIDEBAR_FULL}px !important; 
            box-shadow: 8px 0 25px rgba(0,0,0,0.18) !important;
          }
        }

        /* ── Mobile Overrides ── */
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          .s-mobile-topbar { 
            display: flex !important; 
          }
          .main-content { 
            padding-top: 56px !important; 
            margin-left: 0 !important;
          }
          .navbar-top { 
            left: 0 !important; 
            width: 100% !important; 
          }

          /* Closed state on mobile */
          html body #sidenav-main:not(.is-mobile-open) {
            transform: translateX(-105%) !important;
            margin-left: -300px !important;
            left: -300px !important;
          }

          .s-mobile-close {
              display: none;
              background: none;
              border: none;
              font-size: 22px;
              color: #525f7f;
              cursor: pointer;
              padding: 4px;
              position: absolute;
              right: 14px;
              top: 18px;
              z-index: 10;
          }

          @media (max-width: 767px) {
            .s-mobile-close {
                display: flex !important;
                align-items: center;
                justify-content: center;
              }
            }

          /* Open state on mobile - Beats external Argon CSS */
          html body #sidenav-main.is-mobile-open,
          html body nav#sidenav-main.show,
          html body.g-sidenav-pinned #sidenav-main {
            transform: translateX(0) !important;
            left: 0 !important;
            margin-left: 0 !important;
            width: 270px !important;
            max-width: 85vw !important;
            height: 100vh !important;
            z-index: 99999 !important;
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            box-shadow: 4px 0 25px rgba(0,0,0,0.3) !important;
          }
        }

        .s-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-x: hidden !important;
          overflow-y: auto;
          position: relative;
        }

        .s-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70px;
          padding: 14px 16px;
          flex-shrink: 0;
        }
        .s-brand a { line-height: 0; }
        .s-brand img {
          object-fit: contain;
          max-height: 38px;
          transition: width var(--sb-transition);
        }

        .s-toggle {
          position: absolute;
          right: -13px;
          top: 43px;
          width: 32px;
          height: 32px;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid #dee2e6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.14);
          font-size: 13px;
          z-index: 1050;
          transition: box-shadow 0.2s, transform 0.15s;
          user-select: none;
        }
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          .s-toggle { display: none !important; }
        }

        .s-nav { padding: 10px 8px; flex: 1; }

        .sidebar-nav-link {
          display: flex !important;
          align-items: center !important;
          gap: 10px;
          padding: 10px 14px !important;
          border-radius: 8px;
          margin-bottom: 2px;
          color: #525f7f !important;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-decoration: none !important;
          transition: background 0.15s, color 0.15s !important;
          cursor: pointer;
        }
        .sidebar-nav-link:hover,
        .sidebar-nav-link:focus {
          background: #f4f5f7;
          color: #32325d !important;
        }
        .sidebar-nav-link.active {
          background: #eef2ff;
          color: #5e72e4 !important;
        }
        .sidebar-nav-link.icon-only {
          justify-content: center;
          padding: 10px !important;
        }

        .s-icon { font-size: 15px; min-width: 20px; text-align: center; flex-shrink: 0; }
        .s-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }
        .s-chevron { font-size: 10px; opacity: 0.4; flex-shrink: 0; }

        .s-submenu {
          margin: 2px 8px 4px 20px;
          border-left: 2px solid #e9ecef;
          padding-left: 6px;
        }
        .s-submenu-link {
          display: flex !important;
          align-items: center !important;
          gap: 8px;
          padding: 8px 10px !important;
          font-size: 0.82rem;
          color: #6b7a99 !important;
          border-radius: 6px;
          text-decoration: none !important;
        }

        /* ── Mobile Topbar ── */
        .s-mobile-topbar {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: #fff;
          border-bottom: 1px solid #e9ecef;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          z-index: 99998;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .s-hamburger {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 5px;
          border-radius: 6px;
          z-index: 99999;
          position: relative;
        }
        .s-hamburger:hover { background: #f4f5f7; }
        .s-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #525f7f;
          border-radius: 2px;
          transition: 0.2s;
        }

        /* ── Overlay ── */
        .s-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 99990;
          cursor: pointer;
        }
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          .s-overlay.visible { display: block !important; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={`s-overlay${mobileOpen ? " visible" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Topbar Hamburger */}
      <div className="s-mobile-topbar">
        <button
          type="button"
          className="s-hamburger"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <span style={mobileOpen ? { transform: "rotate(45deg) translate(5px, 5px)" } : {}} />
          <span style={mobileOpen ? { opacity: 0 } : {}} />
          <span style={mobileOpen ? { transform: "rotate(-45deg) translate(5px, -5px)" } : {}} />
        </button>
        {logo && (
          <img
            src={logoImg}
            alt="IOS"
            style={{ height: "26px", objectFit: "contain" }}
          />
        )}
      </div>

      {/* Sidebar */}
      <nav
        id="sidenav-main"
        ref={sidebarRef}
        className={[
          "navbar-vertical",
          isCollapsedView ? "is-collapsed" : "",
          isTabletExpanded ? "is-tablet-expanded" : "",
          mobileOpen ? "is-mobile-open show" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className="s-toggle"
          onClick={handleToggleCollapse}
          role="button"
          tabIndex={0}
        >
          {isCollapsedView ? (
            <IoIosArrowForward style={{ fontSize: "15px" }} />
          ) : (
            <IoIosArrowBack style={{ fontSize: "15px" }} />
          )}
        </div>

        <div className="s-inner">
          <div className="s-brand" style={{ display: "flex", justifyContent: "space-between" }}>
            {logo && (
              <NavbarBrand
                {...brandProps}
                style={{
                  margin: 0,
                  padding: 0,
                  opacity: isScanning ? 0.5 : 1,
                  cursor: isScanning ? "not-allowed" : "pointer",
                }}
                onClick={(e) => {
                  if (isScanning) {
                    e.preventDefault();
                    toast.warn("Scanning in progress");
                  }
                }}>
                <img
                  src={logoImg}
                  alt="IOS"
                  style={{ width: isCollapsedView ? "34px" : "88px" }}
                />

              </NavbarBrand>
            )}

            {breakpoint === "mobile" && (
              <button
                type="button"
                className="s-mobile-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <IoMdClose />
              </button>
            )}

          </div>

          <Nav navbar className="s-nav">
            {routes?.length > 0 && createLinks(routes)}
          </Nav>
        </div>
      </nav>
    </>
  );
};

Sidebar.defaultProps = { routes: [] };

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string,
    imgAlt: PropTypes.string,
  }),
};

export default Sidebar;