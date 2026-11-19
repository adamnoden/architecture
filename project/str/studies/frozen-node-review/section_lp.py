import numpy as np
from scipy.optimize import linprog
R=200; ds=1.25
x,y=np.meshgrid(np.arange(-R+ds/2,R,ds),np.arange(-R+ds/2,R,ds)); sel=x*x+y*y<R*R
x=x[sel];y=y[sel];A=np.full(len(x),float(ds*ds))
t=np.deg2rad(22.5+45*np.arange(8));sx=141*np.cos(t);sy=141*np.sin(t);As=np.pi*22**2/4
# remove steel area locally distributed among grid cells within bar footprints
for xx,yy in zip(sx,sy):
  mask=(x-xx)**2+(y-yy)**2<11**2
  A[mask]*=(sum(A[mask])-As)/sum(A[mask])
mat=np.array([np.r_[A,np.repeat(As,8)],np.r_[A*x,As*sx],np.r_[A*y,As*sy]])
for stress in (8.976,):
 for N in (0,850):
  # maximize moment along diagonal given N and Mx=My
  obj=-(mat[1]+mat[2])/np.sqrt(2)/1e6
  res=linprog(obj,A_eq=[mat[0]/1000,(mat[1]-mat[2])/1e6],b_eq=[N,0],bounds=[(0,stress)]*len(x)+[(-500/1.15,500/1.15)]*8,method='highs')
  print(stress,N,-res.fun, 'feasible141.42',-res.fun>=np.sqrt(2)*100)
