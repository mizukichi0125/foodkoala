import Area from '@/components/area';
import Genre from '@/components/genre';
import Head from 'next/head';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Image from 'next/image';
import useSWR from 'swr';

const fetcher = (resource: string, init: any) =>
  fetch(resource, init).then((res) => res.json());

export default function MenuList() {
  const { data, error } = useSWR(
    'http://localhost:8000/items',
    fetcher
  );

  if (error) return <div>エラーです</div>;
  if (!data) return <div>データが見つかりませんでした</div>;

  type Item = {
    id: number;
    name: string;
    image_url: string;
    price: number;
    explain: string;
    genre_id: number;
    area_id: number;
    shop_id: number;
  };

  return (
    <>
      <Head>
        <title>商品一覧ページ</title>
      </Head>
      <main>
        <Header />
        {data.map((item: Item) => (
          <div key={item.id}>
            <Image
              src={item.image_url}
              alt="メニューの画像"
              width={100}
              height={100}
            />
            <p>{item.name}</p>
            <p>{item.price}円</p>
            <button>カートに追加</button>
          </div>
        ))}
        <Footer />
      </main>
    </>
  );
}
