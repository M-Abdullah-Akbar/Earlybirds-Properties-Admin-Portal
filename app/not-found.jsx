//import Breadcumb from "@/components/common/Breadcumb";
//import Cta from "@/components/common/Cta";
//import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Page Not Found || Proty - Real Estate React Nextjs Template",
  description: "Proty - Real Estate React Nextjs Template",
};
export default function page() {
  return (
    <>
      <div id="wrapper" >
        <Header1 />
        <div className="main-content mt-5">
          {/*<Breadcumb pageName="Page Not found" />*/}
          <div className="page-content">
            <div className="tf-container tf-spacing-1 pt-0">
              <div className="error-404 text-center">
                <h1 className="mb-20 title">Oh no... We lost this page</h1>
                <p className="mb-40">
                  We searched everywhere but couldn’t find what you’re looking
                  for. Let’s find <br />a better place for you to go.
                </p>
                <Link
                  href={"/dashboard"}
                  className="tf-btn bg-color-primary rounded-4 pd-3 fw-6 mx-auto"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
          {/*<Cta />*/}
        </div>

        {/*<Footer1 />*/}
      </div>
    </>
  );
}
