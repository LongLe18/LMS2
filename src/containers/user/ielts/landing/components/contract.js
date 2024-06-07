
import { Button } from 'antd';
import { ArrowRightOutlined, PhoneOutlined } from "@ant-design/icons";

const Contract = () => {
    return (
        <div className="section-cta relative pt-4 mt-5">
            <div className="bg-cta absolute top-0 left-0 right-0 bottom-0 z-1 flex items-center justify-center overflow-hidden">
                <img loading="lazy" className="img-bg" src={require("assets/img/bg-cta-2.svg").default} alt="background 2" />
            </div>
            <div className="container pl-4 relative z-10 mx-auto">
                <div className="grid grid-cols-2 gap-5 items-center">
                    <div className="flex flex-col w-full text-center text-left col-span-2 md:col-span-1">
                        <h3 className="flex flex-col">
                            <b className="flex flex-row items-center mb-2 text-left justify-start">
                            <b className="fw-700 text-white text-3xl text-4xl">Tự Học 
                            <b className="fw-700 text-3xl text-4xl" style={{color:"#e01133"}}> IELTS</b> Mọi Lúc Mọi Nơi</b></b>
                            <b className="fw-700 text-white text-3xl sm:text-4xl">Dễ Dàng - Hiệu Quả</b>
                        </h3>
                        <p className="text-white my-3">Study Plan chi tiết, Learning Profile cá nhân hóa cùng sự hỗ trợ sát sao từ Prep bạn sẽ chủ động trong việc luyện thi online, nhưng không một mình !</p>
                        <div className="flex flex-col flex-row gap-4 mt-3" style={{justifyContent:'start'}}>
                            <Button className='flex flex-center items-center fw-700 rounded-md pl-4 pr-4 pt-3 pb-3' type='primary' icon={<ArrowRightOutlined/>} size='large'>Giúp Tôi Xây Lộ Trình Học</Button>
                            <Button className='flex flex-center items-center fw-700 rounded-md pl-4 pr-4 pt-3 pb-3' type='button' icon={<PhoneOutlined/>} size='large'>Nhận tư vấn</Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center overflow-hidden col-span-2 md:col-span-1">
                        <div className="flex flex-col items-center pt-5">
                            <img loading="lazy" className="object-cover" src={require("assets/img/landingpage/bg-cta-ielts.png").default} alt="Tự học ielts" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Contract;