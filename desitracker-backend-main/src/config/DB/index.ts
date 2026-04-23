// import config from '../config';
// import { USER_ROLE } from '../modules/user/user.constants';
// import { User } from '../modules/user/user.model';

// const superUser = {
//   id: '0001',
//   email: 'kashemaust@gmail.com',
//   password: config.superAdminPassword,
//   needsPasswordChange: false,
//   role: USER_ROLE.superAdmin,
//   status: 'in-progress',
//   isDeleted: false,
// };

// const seedSuperAdmin = async () => {
//   // whenever database connection is established, we will check if there any super-admin exists?
//   const isSuperAdminExists = await User.findOne({
//     role: USER_ROLE.superAdmin,
//   });

//   // if not exists, create super admin
//   if (!isSuperAdminExists) {
//     await User.create(superUser);
//   }
// };

// export default seedSuperAdmin;
