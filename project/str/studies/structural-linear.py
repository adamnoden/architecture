"""Small dense factorisation for the two bounded structural comparisons (no optional CI dependencies)."""
def factor(A):
    n=len(A);m=[row[:] for row in A];perm=list(range(n))
    for c in range(n):
        r=max(range(c,n),key=lambda i:abs(m[i][c]))
        if abs(m[r][c])<1e-8:raise ValueError('singular/unrestrained model')
        m[c],m[r]=m[r],m[c];perm[c],perm[r]=perm[r],perm[c]
        for i in range(c+1,n):
            b=m[i][c]/m[c][c];m[i][c]=b
            if b:
                for j in range(c+1,n):m[i][j]-=b*m[c][j]
    def solve(rhs):
        x=[rhs[i] for i in perm]
        for i in range(n):x[i]-=sum(m[i][j]*x[j] for j in range(i))
        for i in reversed(range(n)):x[i]=(x[i]-sum(m[i][j]*x[j] for j in range(i+1,n)))/m[i][i]
        return x
    return solve
