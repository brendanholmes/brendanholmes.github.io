function label = removeOrphans(im, label)
    %loop through every pixel and if it has 6 or more neighbours of a different
% label, make it that label
numDisim = 0;
numOrphansRemoved = 0;
    for i = 2:size(im,1)-1
        for j = 2:size(im,2)-1
            for ii = 1:3
                for jj = 1:3
                    if label(i,j) ~= label(i+ii-2, j+jj-2)
                        numDisim = numDisim + 1;
                        labelVal = label(i+ii-2, j+jj-2);
                    end
                end
            end
            if numDisim > 4
                label(i,j) = labelVal;
                numOrphansRemoved = numOrphansRemoved + 1;
            end
            numDisim = 0; % reset
            
        end
    end
%     display(numOrphansRemoved) % DEBUGGING
    
end