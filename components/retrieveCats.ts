// import { Cat } from '@/constants/DataTypes';
// import { db } from '@/components/db/db';
// import { Alert } from 'react-native';

// // Function to retrieve cats from the database
// export async function retrieveCats() : Promise<Cat[]> {
//     let Cats: Cat[] = [];
//     try {
//       // setLoading(true)
//       // if (!session?.user) throw new Error('No user on the session!')
//       const { data, error, status } = await db
//   .from('Cat')
//   .select('*');
//   console.log('data', data)
//       if (error && status !== 406) {
//         throw error
//       }
//       if (data) {
//         console.log('success')
//         const newCats: Cat[] = data.map((row: Cat) => ({
//             description: row.description,
//             pin_id: row.pin_id,
//             id: row.id,
//             name: row.name,
//           }));
//         console.log('cats', Cats)
//         Cats = newCats;
//       }
//     } catch (error) {
//       if (error instanceof Error) {
//         Alert.alert(error.message)
//       }
//       Cats = [];
//     } finally {
//       return Cats;
//     }
//   }