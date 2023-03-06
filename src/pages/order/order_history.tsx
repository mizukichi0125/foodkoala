import BreadList, {
  menu_list,
  order_history,
} from 'components/bread_list';
import Footer from 'components/footer';
import Header from 'components/header';
import Auth from 'components/auth';
import Head from 'next/head';
import Link from 'next/link';
import styles from 'styles/order_history.module.css';
import Cookies from 'js-cookie';
import useSWR from 'swr';
import { useEffect, useState } from 'react';

const fetcher = async (resource: string) => {
  const res = await fetch(resource);
  const data: OrderData[] = await res.json();
  return data;
};

export default function OrderHistory() {
  const userId = Cookies.get('user_id');
  const [orderDate, setOrderDate] = useState<Date[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItems[]>([]);
  const [pageId, setPageId] = useState(1);

  //order_historyテーブルから注文内容を取得
  const { data, error } = useSWR(
    `/api/order_history?user_id=eq.${userId}`,
    fetcher
  );

  //ordersテーブルのcart_idを使用して、order_itemsテーブルからitemのデータを取得
  useEffect(() => {
    async function getOrderItems() {
      if (
        data === undefined ||
        data === null ||
        data.length === 0 ||
        pageId === undefined ||
        userId === undefined ||
        userId === null
      ) {
        return;
      } else {
        await fetch(
          `/api/order_items?user_id=eq.${userId}&order_id=eq.${
            data[data.length - pageId].cart_id
          }`
        )
          .then((res) => res.json())
          .then((data) => {
            setOrderItems(data);
          })
          .catch((error) => console.error(error));
      }
    }
    getOrderItems();
  }, [data, userId, pageId]);

  //ordered_atをDate型に変換
  useEffect(() => {
    if (data === undefined || data === null) {
      return;
    }
    const newDateArray = () => {
      const newOrderDate: Date[] = [];
      for (let i = 0; i <= data.length - 1; i++) {
        const orderDate = new Date(data[i].ordered_at);
        newOrderDate.push(orderDate);
      }
      setOrderDate(newOrderDate);
    };
    newDateArray();
  }, [data]);

  //ログイン前（cookieなし）はログインを促す
  if (userId === null || userId === undefined) {
    return (
      <>
        <Header />
        <BreadList list={[menu_list, order_history]} />
        <main>
          <div className={styles.favorite_login}>
            <div className={styles.favorite_login_link}>
              <img src="/images/foodkoala_img2.png" alt="コアラ" />
              <br />
              <br />
              <a href="/login">ログイン</a>
            </div>
            <br />
            <p>注文履歴を表示したい場合はログインをしてください</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) return <div>Error...</div>;
  if (!data || orderDate.length === 0 || pageId === undefined) {
    return (
      <>
        <Head>
          <title>注文履歴</title>
        </Head>
        <Header />
        <BreadList list={[menu_list, order_history]} />
        <div className={styles.h1}>
          <h1>注文履歴一覧</h1>
        </div>
        <div>
          <h2>Loading...</h2>
        </div>
        <Footer />
      </>
    );
  } else if (orderItems.length === 0) {
    return (
      <Auth>
        <Head>
          <title>注文履歴</title>
        </Head>
        <Header />
        <BreadList list={[menu_list, order_history]} />
        <div className={styles.h1}>
          <h1>注文履歴一覧</h1>
        </div>
        <div>
          <h2>注文履歴はありません</h2>
        </div>
        <Footer />
      </Auth>
    );
  } else {
    console.log('orderDate', orderDate);
    console.log('pageId', pageId);
    console.log('data - pageId', data.length - pageId);
    return (
      <Auth>
        <Head>
          <title>注文履歴</title>
        </Head>
        <Header />
        <BreadList list={[menu_list, order_history]} />
        <div className={styles.h1}>
          <h1>注文履歴一覧</h1>
        </div>
        <>
          <div className={styles.order_history}>
            <h2>
              {orderDate[data.length - pageId].getFullYear()}年
              {orderDate[data.length - pageId].getMonth() + 1}月
              {orderDate[data.length - pageId].getDate()}日
              {orderDate[data.length - pageId].getHours()}時
              {orderDate[data.length - pageId].getMinutes()}分
            </h2>
            <div>
              <dl>
                <dt>注文コード</dt>
                <dd>{data[data.length - pageId].order_code}</dd>
                <dt>ご注文内容</dt>
                {orderItems.map((item, index) => (
                  <div key={item.item_name}>
                    <dd>{item.item_name}</dd>
                  </div>
                ))}
                <dt>お支払い金額</dt>
                <dd>{data[data.length - pageId].total}円</dd>
                <dt>お支払い方法</dt>
                <dd>{data[data.length - pageId].payment_method}</dd>
              </dl>
              <div className={styles.link}>
                <Link href={'注文詳細'}>詳細を見る</Link>
              </div>
            </div>
          </div>
        </>
        <div className={styles.buttons}>
          {data.map((item, index) => (
            <input
              type="button"
              value={index + 1}
              onClick={(e) => {
                setPageId(index + 1);
              }}
              key={index}
            />
          ))}
        </div>
        <Footer />
      </Auth>
    );
  }
}

type OrderData = {
  cart_id: number;
  user_id: number;
  order_code: string;
  ordered_at: Date;
  couponcode: string;
  discount: number;
  subtotal: number;
  total: number;
  payment_method: string;
  chopstick: number;
  folk: number;
  spoon: number;
  oshibori: number;
};

type OrderItems = {
  order_id: number;
  item_name: string;
  price: number;
  shop_id: number;
  quantitiy: number;
};
